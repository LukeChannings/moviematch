let envPermissionGranted: boolean | undefined;

export const hasEnvPermissions = async () => {
  if (Deno.permissions && typeof envPermissionGranted === "undefined") {
    let envPermission = await Deno.permissions.query({ name: "env" });
    if (envPermission.state === "prompt") {
      envPermission = await Deno.permissions.request({ name: "env" });
    }

    if (envPermission.state === "denied") {
      envPermissionGranted = false;
      return;
    } else if (envPermission.state === "granted") {
      envPermissionGranted = true;
    }
  }

  return envPermissionGranted;
};

export const getEnv = async (name: string): Promise<string | undefined> => {
  if (!await hasEnvPermissions()) {
    return;
  }

  return Deno.env.get(name);
};
