import { customAlphabet } from "nanoid";

// see: https://github.com/n8n-io/n8n/blob/2c81eca43538580b05e9149d86aad6da59f354a4/packages/%40n8n/utils/src/workflowId.ts#L20
const NANOID_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const generateId = customAlphabet(NANOID_ALPHABET, 16);
