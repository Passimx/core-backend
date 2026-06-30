export class Payload {
  readonly icon?: string;

  readonly title: string;

  readonly body?: string;

  readonly data?: { url?: string };

  readonly silent?: boolean | null;

  readonly requireInteraction?: boolean;

  readonly tag?: string;
}
