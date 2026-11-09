# services/ingest (planned)

Extracts text from uploaded PDF / DOCX / XLSX / PPTX files (GRADKnow did this with `pypdf` + `python-docx`), chunks it, and writes `documents.body` in Supabase.
Until it exists, the admin form accepts pasted text, and reads `.txt` / `.md` directly.
