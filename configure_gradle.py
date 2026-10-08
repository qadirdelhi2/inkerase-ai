import sys
import re

run_num = sys.argv[1] if len(sys.argv) > 1 else '1'
gradle_file = 'android/app/build.gradle'

try:
    with open(gradle_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update versionCode and versionName
    content = re.sub(r'versionCode\s+\d+', f'versionCode {run_num}', content)
    content = re.sub(r'versionName\s+"[^"]+"', f'versionName "1.0.{run_num}"', content)

    signing_code = """
    signingConfigs {
        release {
            storeFile file('inkerase-release.keystore')
            storePassword 'inkerase123'
            keyAlias 'inkerase'
            keyPassword 'inkerase123'
        }
        debug {
            storeFile file('inkerase-release.keystore')
            storePassword 'inkerase123'
            keyAlias 'inkerase'
            keyPassword 'inkerase123'
        }
    }
"""

    if 'signingConfigs {' not in content:
        content = content.replace('buildTypes {', signing_code + '\n    buildTypes {')

    if 'signingConfig signingConfigs.release' not in content:
        content = content.replace('release {', 'release {\n            signingConfig signingConfigs.release')

    with open(gradle_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully configured {gradle_file} with versionCode {run_num} and permanent release keystore!")
except Exception as e:
    print(f"Error configuring {gradle_file}: {e}")
    sys.exit(1)
