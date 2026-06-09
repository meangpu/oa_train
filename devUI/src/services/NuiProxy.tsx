import { GetParentResourceName } from "./Utils";

interface NuiResponse<T = unknown> {
  success: boolean;
  data?: T;
}

declare global {
  interface Window {
    GetParentResourceName?: () => string;
  }
}

export class NuiProxy {
  static async call<T = unknown, P = unknown>(
    method: string,
    parameters?: P
  ): Promise<T | false> {
    try {
      const response = await fetch(
        `https://${GetParentResourceName()}/${method}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: parameters === undefined ? undefined : JSON.stringify(parameters),
        }
      );

      const data = (await response.json()) as NuiResponse<T>;
      if (!data || !data.success) return false;
      return data.data || ({} as T);
    } catch (err) {
      console.error(JSON.stringify(err));
      return false;
    }
  }
}
