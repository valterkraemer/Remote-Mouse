report.pdf: report.tex references.bib Makefile latency.png prompt.png
	pdflatex report
	bibtex report
	pdflatex report
	pdflatex report

clean:
	rm -f *.aux *.log *.bbl *.blg *.dvi

realclean: clean
	rm -f report.pdf
