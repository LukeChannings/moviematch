export const test = async (
  nameOrTest: string | Deno.TestDefinition,
  fn?: () => void | Promise<void>,
) => {
  const name = typeof nameOrTest === "string" ? nameOrTest : nameOrTest.name;
  const test = typeof nameOrTest !== "string" ? nameOrTest.fn : fn;

  if (name && test) {
    try {
      await test();
      console.log(`✅ ${name}`);
    } catch (err) {
      console.error(`❎ ${name}: ${String(err)}`);
      console.error(err);
    }
  }
};
