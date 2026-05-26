## 2024-05-26 - Async Action Feedback Pattern
**Learning:** Adding a loading state (`disabled`, `aria-busy`, and text "Joining...") specifically during the `navigator.mediaDevices.getUserMedia` prompt provides essential user feedback because the async operation blocks until the user interacts with browser permissions.
**Action:** Always wrap media permission requests (or any potentially blocking OS/browser-level prompts) with explicit loading states on the triggering UI element to prevent user confusion.
