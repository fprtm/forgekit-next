import { DomainException } from "./domain.exception";

export class DemoModeException extends DomainException {
  constructor() {
    super("This is a read-only public demo — writes are disabled.", "DEMO_MODE_READ_ONLY", 403);
  }
}
