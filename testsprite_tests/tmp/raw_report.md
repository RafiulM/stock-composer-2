
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** stock-composer-2
- **Date:** 2026-04-03
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Login with valid credentials redirects to dashboard
- **Test Code:** [TC001_Login_with_valid_credentials_redirects_to_dashboard.py](./TC001_Login_with_valid_credentials_redirects_to_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/10b2db29-b47f-486d-a0e3-4b3054acb793
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Login with invalid credentials shows error and stays on login
- **Test Code:** [TC002_Login_with_invalid_credentials_shows_error_and_stays_on_login.py](./TC002_Login_with_invalid_credentials_shows_error_and_stays_on_login.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/7df61156-9171-4777-b3ff-f16a0a3da281
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Register new account redirects to dashboard
- **Test Code:** [TC003_Register_new_account_redirects_to_dashboard.py](./TC003_Register_new_account_redirects_to_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/7b79e328-5337-4f32-8fdf-5846eede1f50
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Register with existing email shows error and stays on register
- **Test Code:** [TC004_Register_with_existing_email_shows_error_and_stays_on_register.py](./TC004_Register_with_existing_email_shows_error_and_stays_on_register.py)
- **Test Error:** The registration page could not be tested because the app is stuck on a redirect screen and the registration form never appeared.

Observations:
- The page displays the message 'Mengalihkan…' (redirecting).
- Current URL is http://localhost:3000/register.
- Only a Notifications region (element index 201) is present and no form fields or buttons are visible.
- No email/password inputs or submit button for registration were found on the page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/e582fe18-e3d3-4a2d-ae48-742bf296e151
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Login form prevents submission with missing required fields
- **Test Code:** [TC005_Login_form_prevents_submission_with_missing_required_fields.py](./TC005_Login_form_prevents_submission_with_missing_required_fields.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/09aa62cc-1355-4c4c-9f08-cb996fd5ef93
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Register form prevents submission with missing required fields
- **Test Code:** [TC006_Register_form_prevents_submission_with_missing_required_fields.py](./TC006_Register_form_prevents_submission_with_missing_required_fields.py)
- **Test Error:** Registration test could not be completed because the registration page did not load and no form was available.

Observations:
- Navigated to http://localhost:3000/register and the page displayed 'Mengalihkan…' (redirecting).
- No registration or login form fields were visible on the page.
- The only interactive element present was a Notifications section (index 187).
- The SPA appears to be stuck or not fully loaded, preventing the registration flow from being exercised.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/634f0d0c-89a4-46c0-a956-754b16bd88b3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Navigate between login and register pages
- **Test Code:** [TC007_Navigate_between_login_and_register_pages.py](./TC007_Navigate_between_login_and_register_pages.py)
- **Test Error:** In-page navigation from the login page to the registration page did not work; the registration form could not be reached or seen.

Observations:
- Clicking the 'Daftar' link on the login page did not change the UI or display the registration form.
- Direct navigation to /register shows only the redirect message 'Mengalihkan…' and no registration form fields or buttons.
- The current page contains only a Notifications section as an interactive element.
- Earlier the login form (email, password, Masuk) was visible with a 'Daftar' link, but that in-page link did not produce the expected transition.

The feature to navigate from login to register via the in-page link appears to be missing or broken.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/9a72fb2d-c435-4c82-a3c5-3d3ae8c7bcd8
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Dashboard loads for authenticated user and shows KPIs and panels
- **Test Code:** [TC008_Dashboard_loads_for_authenticated_user_and_shows_KPIs_and_panels.py](./TC008_Dashboard_loads_for_authenticated_user_and_shows_KPIs_and_panels.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/040e26b8-24af-4852-a18b-504d3885915d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Unauthenticated dashboard access redirects to login
- **Test Code:** [TC009_Unauthenticated_dashboard_access_redirects_to_login.py](./TC009_Unauthenticated_dashboard_access_redirects_to_login.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/bb7d8916-f6e5-4e44-8e7c-46a6d10dbbde
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Dashboard shows charts or empty states based on available data
- **Test Code:** [TC010_Dashboard_shows_charts_or_empty_states_based_on_available_data.py](./TC010_Dashboard_shows_charts_or_empty_states_based_on_available_data.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/5680141f-1a95-466e-9b72-88e58cc78d9e/46bad773-c6e3-4db0-9652-f36933b62d17
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **70.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---