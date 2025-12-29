import { HttpError } from "@/utils/http-error-class";

describe("httpError", () => {
  it("should create an error with message and default status code 500", () => {
    const error = new HttpError("Something went wrong");
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(Error);
  });

  it("should create an error with message and custom status code", () => {
    const error = new HttpError("Not Found", 404);
    expect(error.message).toBe("Not Found");
    expect(error.statusCode).toBe(404);
  });
});
