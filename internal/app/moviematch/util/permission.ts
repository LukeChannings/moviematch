const requestPermission = async (
  desc: Deno.PermissionDescriptor,
): Promise<boolean> => {
  if (Deno.permissions) {
    const status = await Deno.permissions.request(desc);
    return status.state === "granted";
  }

  return false;
};

export const requestRead = (path: string) =>
  requestPermission({ name: "read", path });
export const requestWrite = (path: string) =>
  requestPermission({ name: "write", path });
export const requestReadWrite = async (path: string) =>
  await requestRead(path) && await requestWrite(path);

export const requestEnv = () => requestPermission({ name: "env" });

export const requestNet = (host: string) =>
  requestPermission({ name: "net", host });
