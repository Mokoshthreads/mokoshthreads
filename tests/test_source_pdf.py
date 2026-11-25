import sys
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import draft_resources as drafting

class SourcePDFTests(unittest.TestCase):
    def test_pdf_uses_extracted_text_and_bounded_subprocess(self):
        with patch.object(drafting.subprocess, 'run', return_value=subprocess.CompletedProcess([],0,stdout=b'Factory\n history  text')) as run:
            text=drafting.extract_source_text(b'%PDF-1.4\nexample','application/pdf')
        self.assertEqual(text,'Factory history text')
        self.assertEqual(run.call_args.args[0],['pdftotext','-layout','-','-'])
        self.assertEqual(run.call_args.kwargs['timeout'],25)
        self.assertNotIn('shell',run.call_args.kwargs)
    def test_incorrect_pdf_header_is_rejected(self):
        with patch.object(drafting.subprocess,'run') as run, self.assertRaises(ValueError):
            drafting.extract_source_text(b'<html>Not a PDF</html>','application/pdf')
        run.assert_not_called()
    def test_html_still_excludes_scripts(self):
        self.assertEqual(drafting.extract_source_text(b'<p>Factory history</p><script>ignore</script>','text/html'),'Factory history')
