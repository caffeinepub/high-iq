# High IQ - Chrome Installation & Publishing Guide

This guide explains how to install the High IQ Progressive Web App (PWA) in Chrome and how to prepare it for distribution via the Chrome Web Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Installation (Desktop)](#local-installation-desktop)
3. [Local Installation (Android)](#local-installation-android)
4. [Building for Production](#building-for-production)
5. [Chrome Web Store Submission](#chrome-web-store-submission)
6. [PWA Assets Reference](#pwa-assets-reference)

---

## Prerequisites

- **Chrome Browser**: Version 90 or higher (desktop or Android)
- **HTTPS**: The app must be served over HTTPS for PWA features to work (localhost is exempt during development)
- **Node.js & pnpm**: For building the production version
- **Internet Computer SDK (dfx)**: For deploying the backend canister

---

## Local Installation (Desktop)

### Step 1: Deploy the Application

First, ensure the app is deployed and accessible via HTTPS:

