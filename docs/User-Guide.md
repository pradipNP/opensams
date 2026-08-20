# SAMS Nepal — User Guide

School Asset Management System · Version 1.0.0

This guide explains how to use SAMS Nepal after you have been given an account. Access is limited to what your role allows. If a menu item is missing, you do not have permission for that function.

## Sign in

**Public demo:** [https://opensams.pages.dev](https://opensams.pages.dev) (Cloudflare Pages). The API behind it is [https://opensams.onrender.com](https://opensams.onrender.com) (Render). The first load after idle time can be slow.

Demo accounts (portfolio only):

| Role | Email | Password |
|---|---|---|
| State Administrator | `state.admin@sams.gov.np` | `password` |
| Municipal Officer | `municipal.butwal@sams.gov.np` | `password` |
| School Administrator | `school.kmg@sams.gov.np` | `password` |

Walkthrough video: [`assets/sample.mp4`](../assets/sample.mp4).

1. Open the SAMS Nepal web application (the live demo URL above, or your local `http://localhost:5173`).
2. Enter your email address and password.
3. Select **Sign in**.

Use only the account issued to you. If sign-in fails, check the email and password, then contact a State Administrator. After a successful sign-in you are taken to the dashboard, or to the page you originally requested.

Select **Logout** in the header when you finish work.

## Roles

| Role | Typical scope |
|---|---|
| State Administrator | All municipalities and schools |
| Municipal Officer | Assigned municipality |
| School Administrator | Assigned school |

## Dashboard

The dashboard shows counts and charts for assets, schools, maintenance, and transfers **in your scope**. Use the section links to open the related operational screens. If a section fails to load, use **Retry**.

## Assets

**Assets** lists inventory you are allowed to see. You can search and filter by municipality, school, category, and status (options depend on your role).

- Open a row to view details, history, and the QR value.
- **Create asset** and **Edit asset** appear only when you have write access.
- **Deactivate Asset** is a confirmation action. It hides the asset from the active inventory; it does not physically delete historical records.

You cannot create records against inactive municipalities, schools, or categories.

## Maintenance

**Maintenance** lists requests in your scope.

- School Administrators and State Administrators can create requests for assets they may write.
- Municipal Officers and State Administrators can approve, reject, or complete requests according to the workflow.
- Invalid status changes are rejected by the system. Read the message and retry only with a valid action.

## Transfers

**Transfers** lists movement of assets between schools.

- Authorized users can request a transfer.
- Approvers can approve, reject, or complete; requesters can cancel while the request is still pending, as allowed by the workflow.
- After a transfer is completed, the asset belongs to the destination school.

## Reports

**Reports** provides inventory, municipality, school, maintenance, transfer, and summary views. Each report is limited to your role scope.

Use **Export XLSX** or **Export PDF** on a report page. Wait until the export finishes before leaving the page. Exports include only the filtered, in-scope rows.

## Profile

**My profile** (sidebar footer, or after opening your name area) shows your name, email, role, municipality, school, last login, and permissions. Assignments cannot be changed here. Only a State Administrator can change role and placement.

The profile page also shows the application name and version, with a link to **About System**.

## About System

**About System** (`/about`) describes SAMS Nepal, its modules, technology stack, and version. It does not change data.

## Practical notes

- Work in one browser session. After logout, a previous token cannot be reused.
- If you open a page you are not allowed to use, you are returned to the dashboard with a permission message.
- Use **Retry** when a list or detail page fails to load.
