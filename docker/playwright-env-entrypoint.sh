#!/bin/bash
# Copyright (C) 2025 Monadfix OÜ
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


# Start a tunnel to the outside-running Brick server
gost -L tcp://:8000/host.docker.internal:8000 &>/dev/null &

# Don't open the Playwright test report in the browser
export PW_TEST_HTML_REPORT_OPEN=never

# Trust the mkcert CA (note: this will not work for Firefox or Chromium sadly)
if [[ -d /mkcert-ca ]]; then
  export CAROOT=/mkcert-ca
  mkcert -install
  export NODE_EXTRA_CA_CERTS=/mkcert-ca/rootCA.pem
else
  echo "Please bind /mkcert-ca to a directory containing the mkcert root CA."
  echo "This directory can be queried with: mkcert -CAROOT"
  exit 1
fi

# Either execute bash, or playwright w/ whatever args were passed
if [[ "$@" == "bash" ]]; then
  exec bash
else
  exec pnpm exec playwright test --workers=1 "$@"
fi