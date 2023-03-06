import * as process from "process";
import * as path from "path";
import { vi } from "vitest";
import * as os from "os";

type Command = {
  meta: { [k: string]: string };
  content: string;
};

type ActionOutput = { [k: string]: Command[] };

type ActionInput = {
  relativePath: string[];
  input?: { [k: string]:string };
  context?: Partial<{
    eventName: string
    sha: string
    ref: string
    workflow: string
    action: string
    actor: string
    job: string
    runNumber: string
    runId: string
    apiUrl: string
    serverUrl: string
    graphqlUrl: string
    repository: string
    payloadPath: string
  }>
};

export function backupStdOut() {
  const originalStdOut = process.stdout.write
  const originalStdErr = process.stderr.write
  let logs: {[n:number]:  { stdout: string, stderr: string }} = {};
  let count = -100000;

  return {
    emulate: function(){
      count++;
      logs[count] = {
        stdout: "",
        stderr: "",
      };
      process.stdout.write = (s:string) => {
        logs[count].stdout += s;
        return true;

      };
      process.stderr.write = (s:string) => {
        logs[count].stderr += s;
        return true;
      };
      return function(): string[] {
        const stdout = logs[count].stdout
          .split(os.EOL)
          .filter(x => x.length !== 0);
        const stderr = logs[count].stderr
          .split(os.EOL)
          .filter(x => x.length !== 0);
        return [...stdout, ...stderr]
      }
    },
    restore: function() {
      process.stdout.write = originalStdOut;
      process.stderr.write = originalStdErr;
    }
  }

}

export async function emulateAction({
  relativePath,
  input,
  context,
}: ActionInput, emulator: () => (()=>string[])): Promise<ActionOutput> {
  vi.stubEnv("GITHUB_OUTPUT", '');
  if(input != null) {
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        vi.stubEnv(`INPUT_${key.replace(/ /g, "_").toUpperCase()}`, input[key])
      }
    }
  }
  if(context) {
    if(context.payloadPath) vi.stubEnv("GITHUB_EVENT_PATH", context.payloadPath);
    if(context.eventName) vi.stubEnv("GITHUB_EVENT_NAME", context.eventName);
    if(context.sha) vi.stubEnv("GITHUB_SHA", context.sha);
    if(context.ref) vi.stubEnv("GITHUB_REF", context.ref);
    if(context.workflow) vi.stubEnv("GITHUB_WORKFLOW", context.workflow);
    if(context.action) vi.stubEnv("GITHUB_ACTION", context.action);
    if(context.actor) vi.stubEnv("GITHUB_ACTOR", context.actor);
    if(context.job) vi.stubEnv("GITHUB_JOB", context.job);
    if(context.runNumber) vi.stubEnv("GITHUB_RUN_NUMBER", context.runNumber);
    if(context.runId) vi.stubEnv("GITHUB_RUN_ID", context.runId);
    if(context.apiUrl) vi.stubEnv("GITHUB_API_URL", context.apiUrl);
    if(context.serverUrl) vi.stubEnv("GITHUB_SERVER_URL", context.serverUrl);
    if(context.graphqlUrl) vi.stubEnv("GITHUB_GRAPHQL_URL", context.graphqlUrl);
    if(context.repository) vi.stubEnv("GITHUB_REPOSITORY", context.repository);
  }

  const result = emulator();
  await import(path.join("..", "..", ...relativePath));
  const output = result();
  return output
    .map((str) => {

      if(!str.startsWith("::")) {
        return { command: "info", meta: {}, content: str };
      }
      const [, metaString, content] = /::(.*?)::(.*)/.exec(str) as unknown as [
        string,
        string,
        string
      ];
      const meta = (metaString as string)
        .split(" ")
        .filter((pair) => pair.includes("="))
        .reduce((acc: { [k: string]: string }, pair) => {
          const [key, value] = pair.split("=");
          acc[key] = value;
          return acc;
        }, {});
      const command = metaString.split(" ")[0];
      return { command, meta, content };
    })
    .reduce((acc: ActionOutput, { command, meta, content }) => {
      if (!acc[command]) {
        acc[command] = [];
      }
      acc[command].push({ meta, content });
      return acc;
    }, {});
}

export const actionScripts = ["tests", "integration", "action_scripts"];
