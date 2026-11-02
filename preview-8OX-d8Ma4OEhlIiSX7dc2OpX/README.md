# Elite Redux 한국어 도감 — STAGE 23 로컬 검토/배포 안전성 검증 후보

이 디렉터리는 **Sito-K/ER_KoreaDex** 운영 `main`에 반영되지 않은 검증 후보입니다. 자동 배포/자동 푸시는 포함하지 않습니다.

## 사이트 범위

- Pokémon·폼 1,938개 및 해당 로컬 PNG 1,938개
- 기술 1,040개, 특성 1,083개
- 일반 진화 749건, 메가·특수 변화 304건
- 폼 변화 113건(성별 제한 9건), 퇴화 엔진 링크 10건
- 야생 출현 관계 2,572건
- 게임 스크립트/상점 코드 기반 획득 관계 215건(184종). 판매·접근 가능성은 실제 게임에서 검증되지 않았습니다.

원본 기준: `Sito-K/EliteReduxKorean` `korean` 커밋 `888d826064ba45d9febfa3a64d8a2b9d34503360`.
각 STAGE의 `STAGE*_SOURCE_POLICY.txt`에 데이터 출처 및 제약이 정리되어 있습니다.

## 배포 전 자체 검사

```bash
python -m pip install Pillow==11.3.0
python tools/stage21/verify_release.py . --report stage21-release-gate.json
node tools/stage11/verify_source_gaps.js .
node tools/stage10/simulate_dom_callbacks.js .
node tools/stage10/simulate_detail_modules.js .
node tools/stage10/simulate_stage9_network.js .
for f in tools/stage21/*_vm.js tools/stage21/*_smoke.js; do node "$f" .; done
```

GitHub Actions (`.github/workflows/verify-native-dex.yml`)에서 같은 배포 전 검사를 읽기 전용으로 수행할 수 있습니다.
기존 `tools/stage10/verify_stage10.py`, `tools/stage10/verify_stage9_data.js`, `tools/stage11/simulate_stage25_source_labels.js`는 **역사적 STAGE 검사용**으로 유지됩니다. 현행 런타임 구조와 불일치하기 때문에 배포 게이트에서는 실행하지 않습니다. 삭제·결과 위조·조건 무력화 없이 현행 검증기로 교체했습니다.

## 확인되지 않은 항목

이 검증은 **정적 검사와 Node.js 모의 DOM 검사**입니다. 실제 PC Chrome/모바일 Safari/Chrome, VoiceOver/TalkBack, 네트워크 전환 및 실제 게임 구매·진화/폼 변경 동작은 확인되지 않았습니다. 배포 전 `STAGE21_BROWSER_CHECKLIST.md`를 사용해 실측해야 합니다.

기존 운영 저장소에는 구형 NextDex 연동 workflow가 남아 있으므로, 추후 `main`에 반영할 때 구형 자동 쓰기 작업/운영 CI와의 충돌을 별도로 검토해야 합니다.

## STAGE22 운영 workflow 전환 전 필수 조건

운영 main의 44개 구형 workflow는 **이 ZIP을 업로드하는 것만으로 삭제되지 않습니다.** 배포 승인 전 `STAGE22_DEPLOYMENT_CHECKLIST.md`와 `tools/stage22/verify_preflight.py`를 확인하세요. 구형 쓰기 위험 21개/자동 레거시 1개가 확인됐으며, 이 후보는 읽기 전용 CI 1개만 포함합니다.

```bash
python tools/stage22/verify_preflight.py . --report stage22-preflight.json
```

현재 PC·모바일 브라우저 실측은 환경상 미완료, 따라서 배포 판정 HOLD.

## STAGE23 로컬 브라우저 검토 키트

`STAGE23_DEVICE_QA_RUNBOOK.md`에 있는 로컬 서버 명령으로 **운영 GitHub에 반영하지 않고** 검토할 수 있습니다.

```bash
python tools/stage23/preview_server.py . --port 8765
python tools/stage23/verify_preview.py . --report stage23-local-report.json
```

`STAGE23_QA_RESULT_TEMPLATE.json`은 **사용자 실기기 검사 결과가 아닌 빈 기록 양식**입니다. 실제 Chrome/Safari, 320/375/768/1280px, VoiceOver/TalkBack은 여전히 미검증입니다. 운영 자동화 44개 미정리, 배포 승인 없음, 따라서 HOLD.
