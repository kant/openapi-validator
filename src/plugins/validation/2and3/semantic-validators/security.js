// Assertation 1:
// Items in `security` must match a `securityDefinition`.

module.exports.validate = function({ resolvedSpec, isOAS3 }) {
  const errors = [];
  const warnings = [];

  const securityDefinitions = isOAS3
    ? resolvedSpec.components && resolvedSpec.components.securitySchemes
    : resolvedSpec.securityDefinitions;

  function walk(obj, path) {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    if (path[path.length - 2] === 'security') {
      // Assertation 1
      Object.keys(obj).map(key => {
        const securityDefinition =
          securityDefinitions && securityDefinitions[key];
        if (!securityDefinition) {
          errors.push({
            message: 'security requirements must match a security definition',
            path: path
          });
        }

        if (securityDefinition) {
          const scopes = obj[key];
          if (Array.isArray(scopes)) {
            // Check for unknown scopes

            scopes.forEach((scope, i) => {
              const scopeIsDefined = isOAS3
                ? checkOAS3Scopes(scope, securityDefinition)
                : checkSwagger2Scopes(scope, securityDefinition);
              if (!scopeIsDefined) {
                errors.push({
                  message: `Definition could not be resolved for security scope: ${scope}`,
                  path: path.concat([i.toString()])
                });
              }
            });
          }
        }
      });
    }

    if (Object.keys(obj).length) {
      return Object.keys(obj).map(k => walk(obj[k], [...path, k]));
    } else {
      return null;
    }
  }

  walk(resolvedSpec, []);

  return { errors, warnings };
};

// return true if scope is defined
function checkSwagger2Scopes(scope, definition) {
  return Boolean(definition.scopes && definition.scopes[scope]);
}

// return true if scope is defined
function checkOAS3Scopes(scope, definition) {
  let scopeIsDefined = false;
  if (definition.flows) {
    Object.keys(definition.flows).forEach(flowType => {
      if (
        definition.flows[flowType].scopes &&
        definition.flows[flowType].scopes[scope]
      ) {
        scopeIsDefined = true;
        return;
      }
    });
  }
  // scopes for openIdConnet are not definied in the document
  if (definition.type && definition.type === 'openIdConnet') {
    scopeIsDefined = true;
  }
  return scopeIsDefined;
}
