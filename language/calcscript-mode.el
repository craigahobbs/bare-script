;;; calcscript-mode.el --- Major mode for editing CalcScript files

;; Version: 0.4

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
   '("async" "break" "continue" "do" "else" "endforeach" "endfunction"
     "endif" "endwhile" "false" "foreach" "function" "if" "in" "include"
     "jump" "jumpif" "null" "return" "then" "true" "while")
   'words)
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

;;;###autoload
(define-derived-mode calcscript-mode prog-mode "CalcScript"
  "Major mode for editing CalcScript source code"

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
  )

(provide 'calcscript-mode)

;;; calcscript-mode.el ends here
