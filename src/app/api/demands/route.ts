import { handlers } from "../../../server/http";
import { JsonStore } from "../../../server/json-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const { GET, POST } = handlers(new JsonStore());
