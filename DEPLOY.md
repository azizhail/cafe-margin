# CafeMargin - GitHub Pages deploy checklist

## 1) Local project status
- The app files are ready locally in this folder.
- The access request bug was fixed in [app.js](app.js): it no longer crashes when Supabase returns an empty JSON response.
- Static validation result: no JavaScript errors reported for [app.js](app.js).

## 2) Publish to GitHub Pages
Open PowerShell in this folder and run:

```powershell
git init
git add .
git commit -m "Fix access request flow and email fallback"
git branch -M main
git remote add origin https://github.com/azizhail/cafe-margin.git
git push -u origin main
```

## 3) Enable GitHub Pages
1. Open the repository in GitHub.
2. Go to Settings > Pages.
3. Select "Deploy from a branch".
4. Branch: main
5. Folder: /root
6. Save.

## 4) Use the correct live URL
After Pages is enabled, use:

```text
https://azizhail.github.io/cafe-margin/?fixed=1
```

## 5) Test access request
1. Open the site.
2. Click "إنشاء حساب جديد".
3. Fill:
   - البريد الإلكتروني
   - الاسم الكامل
   - اسم المحل
   - الصلاحية
4. Click "إرسال الطلب".
5. If the request reaches the app, the form should no longer fail on empty JSON responses.

## 6) Notes
- The old URL `https://erthcafe11.github.io/CafeMargin/` is not valid for this project and is unrelated to the app logic.
- The app was checked live and the correct working URL is the `azizhail` Pages project.
