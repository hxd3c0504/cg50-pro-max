#!/bin/sh
task_volume="${3:-/}"
previous_app="${task_volume%/}/Applications/CG50Teaching.app"
upgraded_app="${task_volume%/}/Applications/CG50 Pro Max.app"

if [ -d "$previous_app" ] && [ ! -e "$upgraded_app" ]
then
    previous_id=$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$previous_app/Contents/Info.plist" 2>/dev/null)
    if [ "$previous_id" = "local.cg50.teaching" ]
    then
        /bin/mv "$previous_app" "$upgraded_app" || exit 1
    fi
fi
exit 0
