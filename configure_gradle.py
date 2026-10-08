import sys
import re

run_num = sys.argv[1] if len(sys.argv) > 1 else '25'
gradle_file = 'android/app/build.gradle'

try:
    with open(gradle_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update versionCode and versionName (support both single & double quotes)
    content = re.sub(r'versionCode\s+\d+', f'versionCode {run_num}', content)
    content = re.sub(r'versionName\s+["\'][^"\']+["\']', f'versionName "1.0.{run_num}"', content)

    # 2. Add signingConfigs block before buildTypes
    signing_block = """
    signingConfigs {
        release {
            storeFile file('inkerase-release.keystore')
            storePassword 'inkerase123'
            keyAlias 'inkerase'
            keyPassword 'inkerase123'
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }
"""
    if 'signingConfigs {' not in content:
        content = content.replace('buildTypes {', signing_block + '\n    buildTypes {')

    # 3. Add signingConfig inside buildTypes.release
    content = re.sub(
        r'(buildTypes\s*\{[\s\S]*?release\s*\{)',
        r'\1\n            signingConfig signingConfigs.release',
        content
    )

    # 4. Add debug block to buildTypes using signingConfigs.release
    if 'debug {' in content:
        content = re.sub(
            r'(debug\s*\{)',
            r'\1\n            signingConfig signingConfigs.release',
            content
        )
    else:
        debug_block = """
        debug {
            signingConfig signingConfigs.release
        }"""
        content = re.sub(r'(buildTypes\s*\{)', r'\1' + debug_block, content)

    with open(gradle_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully configured {gradle_file} with versionCode {run_num} and permanent release keystore!")
    print("--- Configured build.gradle content ---")
    print(content)
except Exception as e:
    print(f"Error configuring {gradle_file}: {e}")
    sys.exit(1)
