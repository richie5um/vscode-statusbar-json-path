# Change Log

All notable changes to the "jsonpath" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [2.0.0]

- Reorganised extension + clean
- Bump dependencies
- Lint with ESLint
- New option to select path separator (dots or indexes)
- Fix issues with unescaped character

## [1.0.0]

- Added an option to change keys separator (dots or indexes)
- Fixed all unescaped characters (again)
- Extended filetypes (Amazon State Language (asl), AWS System Manager Document (ssm-json))
- Only shows Path for JSON files (and 'JSON with comments', although this may cause path detection issues).
- Status bar item now copies to Clipboard - thanks to Tyderion.
- Switched clipboard package - thanks to floatdrop
- Fixed issue with slashes preceding quotes
- Fixed issue with file detection - thanks to Outrigger047
- Support for more special characters - thanks to Nuaduwodan
