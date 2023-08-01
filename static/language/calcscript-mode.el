;;; calcscript-mode.el --- Major mode for editing CalcScript files

;; Version: 0.6

;;; Commentary:

;; To install, add the following to your .emacs file:

;; (package-initialize)
;;
;; (unless (package-installed-p 'calcscript-mode)
;;   (let ((mode-file (make-temp-file "calcscript-mode")))
;;     (url-copy-file "https://craigahobbs.github.io/calc-script/language/calcscript-mode.el" mode-file t)
;;     (package-install-file mode-file)
;;     (delete-file mode-file)))
;; (add-to-list 'auto-mode-alist '("\\.\\(?:[Cc]alc-?[Ss]cript\\|mds\\)\\'" . calcscript-mode))

;;; Code:

(defconst calcscript-keywords
  (regexp-opt
   '("async" "break" "continue" "else" "elif" "endfor" "endfunction"
     "endif" "endwhile" "false" "for" "function" "if" "in" "include"
     "jump" "jumpif" "null" "return" "true" "while")
   'symbols)
  )

(defconst calcscript-font-lock-keywords
  (list
   (cons calcscript-keywords 'font-lock-keyword-face)

   ;; Rule for variable assignment highlighting
   '("^\\s-*\\([_A-Za-z][_A-Za-z0-9]*\\)\\s-*=" 1 'font-lock-variable-name-face)

   ;; Rule for label highlighting
   '("^\\s-*\\([_A-Za-z][_A-Za-z0-9]*\\)\\s-*:\\s-*$" 1 'font-lock-constant-face)
   )
  )

(defun calcscript-open-language-documentation ()
  "Open CalcScript language documentation"
  (interactive)
  (browse-url "https://craigahobbs.github.io/calc-script/language/")
  )

(defun calcscript-open-markdownup-library ()
  "Open MarkdownUp library documentation"
  (interactive)
  (browse-url "https://craigahobbs.github.io/markdown-up/library/")
  )

(defun calcscript-open-markdownup-function ()
  "Open CalcScript Library documentation for the function at point"
  (interactive)
  (let* ((library-url "https://craigahobbs.github.io/markdown-up/library/#var.vName='%s'")
         (word-at-point (thing-at-point 'symbol))
         (formatted-url (format library-url word-at-point)))
    (if word-at-point (browse-url formatted-url)
      (message "No valid CalcScript function at point"))
    )
  )

;;;###autoload
(define-derived-mode calcscript-mode prog-mode "CalcScript"
  "Major mode for editing CalcScript files"

  ; Change single quote syntax to behave like double quotes
  (modify-syntax-entry ?' "\"" calcscript-mode-syntax-table)

  ; Ensure double quotes are treated as string delimiters
  (modify-syntax-entry ?\" "\"" calcscript-mode-syntax-table)

  ; Ensure backslashes are treated as escape characters
  (modify-syntax-entry ?\\ "\\" calcscript-mode-syntax-table)

  ; Specify that comments start with '#'
  (modify-syntax-entry ?# "<" calcscript-mode-syntax-table)

  ; Specify that comments end with a newline
  (modify-syntax-entry ?\n ">" calcscript-mode-syntax-table)

  ;; Set comment-related variables
  (setq-local comment-start "#")
  (setq-local comment-start-skip "#+\\s-*")

  ;; Apply font-lock rules for syntax highlighting
  (setq-local font-lock-defaults '(calcscript-font-lock-keywords))

  ;; Bind the key for browsing documentation
  (define-key calcscript-mode-map (kbd "C-c C-l") 'calcscript-open-language-documentation)
  (define-key calcscript-mode-map (kbd "C-c C-m") 'calcscript-open-markdownup-library)
  (define-key calcscript-mode-map (kbd "C-c C-f") 'calcscript-open-markdownup-function)
  )

(provide 'calcscript-mode)

;;; calcscript-mode.el ends here
