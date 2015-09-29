plan.pdf: plan.tex references.bib Makefile
	pdflatex plan
	bibtex plan
	pdflatex plan
	pdflatex plan

clean:
	rm -f *.aux *.log *.bbl *.blg *.dvi

realclean: clean
	rm -f plan.pdf
