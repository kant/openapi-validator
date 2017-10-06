import expect from "expect"
import { validate } from "plugins/validation/semantic-validators/validators/operation-ids"

describe("validation plugin - semantic - operation-ids", function () {
  
  it("should complain about a repeated operationId in the same path", function() {

    const spec = {
      paths: {
        "/coolPath": {
          post: {
            summary: "post operation",
            operationId: "bestOperation"
          },
          get: {
            summary: "get operation",
            operationId: "bestOperation"
          }
        }
      }
    }

    let res = validate({ jsSpec: spec })
    expect(res.errors.length).toEqual(1)
    expect(res.errors[0].path).toEqual(["paths./coolPath.get.operationId"])
    expect(res.errors[0].message).toEqual("operationIds must be unique")
    expect(res.warnings.length).toEqual(0)
  })

  it("should complain about a repeated operationId in a different path", function() {

    const spec = {
      paths: {
        "/coolPath": {
          post: {
            summary: "post operation",
            operationId: "bestOperation"
          },
          get: {
            summary: "get operation",
            operation: "getOperation"
          }
        },
        "/greatPath": {
          put: {
            summary: "put operation",
            operationId: "bestOperation"
          }   
        }
      }
    }

    let res = validate({ jsSpec: spec })
    expect(res.errors.length).toEqual(1)
    expect(res.errors[0].path).toEqual(["paths./greatPath.put.operationId"])
    expect(res.errors[0].message).toEqual("operationIds must be unique")
    expect(res.warnings.length).toEqual(0)
  })
})