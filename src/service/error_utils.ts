export const extractAPIErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const errObj = error as Record<string, unknown>;

    // openai client error shape: error.error.message
    const nestedError = errObj["error"];
    if (
      nestedError &&
      typeof nestedError === "object" &&
      typeof (nestedError as Record<string, unknown>).message === "string"
    ) {
      const message = (nestedError as Record<string, unknown>).message as string;
      if (message.trim() !== "") {
        return message;
      }
    }

    // fetch-like response with data.error.message
    const response = errObj["response"] as Record<string, unknown> | undefined;
    if (response) {
      const data = response["data"] as Record<string, unknown> | undefined;
      if (data) {
        const dataError = data["error"] as Record<string, unknown> | undefined;
        if (dataError && typeof dataError.message === "string") {
          return dataError.message;
        }
      }
    }

    if (typeof errObj["message"] === "string" && errObj["message"].trim() !== "") {
      return (errObj["message"] as string).trim();
    }
  }

  if (error instanceof Error && error.message.trim() !== "") {
    return error.message.trim();
  }

  return String(error ?? "Unknown error");
};
