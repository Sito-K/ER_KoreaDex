# STAGE 23 — 검토용 로컬 사이트 사용법 및 수동 QA

**주의: 아직 미배포이며, 아래 절차를 실행하지 않은 항목은 모두 `NOT_TESTED`입니다.**

## PC에서 로컬 사이트 보기 (인터넷 없이 가능)

1. 최신 `ER_KoreaDex_STAGE23_SITE_CANDIDATE_20261102.zip`을 압축 해제합니다. `site/` 폴더가 생깁니다.
2. PC에 Python 3.9 이상이 있으면 터미널에서 `site/` 안으로 이동합니다.
3. `python tools/stage23/preview_server.py . --port 8765` 를 실행합니다.
4. 브라우저 주소창에서 **http://127.0.0.1:8765/** 를 엽니다.
5. 확인이 끝나면 터미널에서 `Ctrl+C`로 서버를 종료합니다. 데이터 업로드/깃허브 변경은 없습니다.

**휴대전화 테스트:** 같은 신뢰 가능한 가정용 Wi-Fi에 연결된 PC에서, 명시적으로
`python tools/stage23/preview_server.py . --host 0.0.0.0 --port 8765`를 실행합니다.
휴대전화의 Safari/Chrome에서 **http://PC의_사설_IP:8765/** 를 엽니다.
외부 인터넷에 포트를 공개하지 마세요. 로그인이나 HTTPS가 없는 임시 서버입니다.
방화벽 또는 회사/공용 Wi-Fi에서는 접속이 제한될 수 있습니다. 이 접속은 보장되지 않습니다.

## 검증 동작 — 사용자 실행 전부 미검증

| ID | 기기·상태 | 실행할 동작 | 성공 기준 | 현재 판정 |
|---|---|---|---|---|
| Q01 | PC Chrome/Edge 1280px | 첫 화면 열기 | UI·포켓몬 1,938종 로드, 콘솔 오류 없음 | NOT_TESTED |
| Q02 | PC Chrome/Edge | 한글/번호 검색 후 초기화 | 결과 변경·빈 결과 처리·초기화 | NOT_TESTED |
| Q03 | PC Chrome/Edge | 기본·폼·메가, 타입, 정렬 변경 | 결과 개수 및 순서 정상 | NOT_TESTED |
| Q04 | PC Chrome/Edge | 기술·특성 탭, 상세 설명 열기 | 데이터 로드·닫기 후 상태 정상 | NOT_TESTED |
| Q05 | PC Chrome/Edge | 레오꼬/화염레오 등 성별 진화 확인 | 수컷·암컷 조건 표시 | NOT_TESTED |
| Q06 | PC Chrome/Edge | 이브이·네크로즈마 퇴화/폼 연동 | 일반 진화와 퇴화 구분 | NOT_TESTED |
| Q07 | 태블릿 768px | 필터·카드·상세창 스크롤 | 수평 오버플로 없음 | NOT_TESTED |
| Q08 | 모바일 375px | 3개 주 탭, 카드 탭, 상세창 | 한 줄 탭·44px 터치 버튼·닫기 정상 | NOT_TESTED |
| Q09 | 작은 모바일 320px | 검색·필터·모달·폼 링크 | 글자 잘림/수평 스크롤 없음 | NOT_TESTED |
| Q10 | PC 키보드 | Tab, Shift+Tab, Escape | 모달 초점 가둠·원래 위치 복귀 | NOT_TESTED |
| Q11 | iOS VoiceOver/Android TalkBack | 탭·검색·상세창·링크 읽기 | 낭독 순서·이름·역할 식별 | NOT_TESTED |
| Q12 | 느린 네트워크 | 상세 로드 도중 닫기·다른 포켓몬 선택 | 구형 응답의 새 모달 재오픈 없음 | NOT_TESTED |
| Q13 | 오프라인→온라인 | 기술/특성 로드 실패 후 재시도 | 로딩 실패 복구 | NOT_TESTED |
| Q14 | PC·모바일 | 새로고침/뒤로가기·가로/세로 회전 | 페이지 상태 이상 없음 | NOT_TESTED |
| Q15 | 게임 실기기 비교 | 진화·상점·폼 조건 대조 | 원본 게임과 일치 | NOT_TESTED |
| Q16 | 운영 배포 | 운영 44개 workflow 백업 및 정리 | 승인·검증된 cutover만 수행 | BLOCKED |

수동 검사 기록은 `STAGE23_QA_RESULT_TEMPLATE.json` 복사본에 `PASS`/`FAIL`/`BLOCKED`와 기기·브라우저·재현 순서를 기록하세요.
실제 화면 캡처를 보내면 증거 기반으로 후속 수정할 수 있습니다. 미실행 테스트를 PASS로 변경하지 마세요.

## 자동 사전 검사 (실제 브라우저 검사가 아님)

`python tools/stage23/verify_preview.py . --report stage23-local-report.json`

이 검사는 로컬 HTTP 응답과 정적 파일·보안을 확인합니다. Python 내장 모듈만 필요합니다.
운영 GitHub 44개 워크플로 정리 및 사용자 배포 승인이 있기 전에는 운영 업데이트를 진행하면 안 됩니다.
