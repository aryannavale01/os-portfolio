# E2E Test Results

**Run at:** 2026-08-17T16:48:48.075Z  
**Duration:** 3m 55s

## Summary

| Metric | Count |
|--------|-------|
| Total  | 38 |
| Passed | 37 |
| Failed | 1 |
| Flaky  | 0 |
| Skipped | 0 |

## Test Suites

### Desktop / Intro (8 tests — 8 passed)
- boot screen shows progress bar and completes
- wallpaper image loads correctly
- name heading is visible
- cycling tagline changes text over time
- dock is visible at bottom of screen
- menu bar is visible at top
- desktop icons are present
- fullscreen prompt appears and can be dismissed

### Window System (13 tests — 13 passed)
- opens Finder from dock
- opens Terminal from dock
- opens Notes from dock
- opens Mail from dock
- opens System Settings from dock
- opens Document Reader from dock
- opens Ultron from dock
- opens Music from dock
- opens Safari from dock
- clicking the same dock icon again minimizes and restores
- close button removes the window
- maximize and restore a window
- dragging a window changes its position

### Finder / File System (6 tests — 6 passed)
- opening Finder shows project folders
- navigating into a project folder shows breadcrumb
- desktop Research folder opens Finder in research mode
- desktop Projects folder opens Finder in projects mode
- Finder sidebar has research and projects entries
- double-clicking a PDF on desktop opens Document Reader

### Ask Ultron (AI Chatbot) (6 tests — 6 passed)
- suggested questions are visible on empty state
- clicking a suggested question sends it and gets a response
- code request shows refusal message
- new chat button clears messages
- send button is disabled when input is empty
- rate limiting triggers after rapid requests

### Visual Regression (4 tests — 4 passed)
- fresh desktop load
- Finder window open
- Ask Ultron chat window
- Terminal window

## Intentionally Failing Tests

### Test Infrastructure Sanity Check > intentionally fails to prove tests actually catch bugs
```
Expected: 999
Received: 2
```
This test is designed to fail to prove the test infrastructure works correctly.

---
*Generated from Playwright E2E test run on laptop viewport (1440x900, Chromium).*
