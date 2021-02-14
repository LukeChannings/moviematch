import { Response, ServerRequest } from "http/server.ts";

export type RouteHandler = (req: ServerRequest) => Promise<Response | void>;
