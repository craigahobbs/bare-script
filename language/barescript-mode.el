;;; barescript-mode.el --- Major mode for editing BareScript files

;; Version: 0.9.0

;;; Commentary:

;; To install, add the following to your .emacs file:

;; (package-initialize)
;;
;; (unless (package-installed-p 'barescript-mode)
;;   (let ((mode-file (make-temp-file "barescript-mode")))
;;     (url-copy-file "https://craigahobbs.github.io/bare-script/language/barescript-mode.el" mode-file t)
;;     (package-install-file mode-file)
;;     (delete-file mode-file)))
;; (add-to-list 'auto-mode-alist '("\\.bare\\'" . barescript-mode))

;;; Code:

(defconst barescript-keywords
  (regexp-opt
   '("async" "break" "continue" "else" "elif" "endfor" "endfunction"
     "endif" "endwhile" "false" "for" "function" "if" "in" "include"
     "jump" "jumpif" "null" "return" "true" "while")
   'symbols)
  )

(defconst barescript-font-lock-keywords
  (list
   (cons barescript-keywords 'font-lock-keyword-face)

   ;; Rule for variable assignment highlighting
   '("^\\s-*\\([_A-Za-z][_A-Za-z0-9]*\\)\\s-*=" 1 'font-lock-variable-name-face)

   ;; Rule for label highlighting
   '("^\\s-*\\([_A-Za-z][_A-Za-z0-9]*\\)\\s-*:\\s-*$" 1 'font-lock-constant-face)
   )
  )

(defun barescript-indent-line (&optional after-newline)
  "Indent current line according to BareScript rules."
  (interactive)
  (let* ((cur (current-indentation))
         (prev (save-excursion
                 (forward-line -1)
                 (while (and (not (bobp)) (looking-at "^\\s-*$")) (forward-line -1))
                 (current-indentation))))
    (indent-line-to
     (cond ((< (point) (+ (line-beginning-position) (current-indentation))) cur)
           ((= cur 0) (if (and (= prev 0) (not after-newline)) tab-width prev))
           ((> cur prev) (max 0 (- prev tab-width)))
           ((> cur (- prev tab-width)) (+ prev tab-width))
           (t (max 0 (- cur tab-width)))))))

(defun barescript-newline-and-indent ()
  "Insert newline and indent the new line."
  (interactive)
  (delete-horizontal-space t)
  (newline)
  (barescript-indent-line t))

(defun barescript-open-language ()
  "Open BareScript language documentation"
  (interactive)
  (browse-url "https://craigahobbs.github.io/bare-script/language/")
  )

(defun barescript-open-library ()
  "Open BareScript library documentation"
  (interactive)
  (browse-url "https://craigahobbs.github.io/bare-script/library/")
  )

(defun barescript-open-library-function ()
  "Open BareScript library documentation for the function at point"
  (interactive)
  (let* ((library-url "https://craigahobbs.github.io/bare-script/library/#var.vName='%s'")
         (word-at-point (thing-at-point 'symbol))
         (formatted-url (format library-url word-at-point)))
    (if word-at-point (browse-url formatted-url)
      (message "No BareScript function at point"))
    )
  )

;;;###autoload
(define-derived-mode barescript-mode prog-mode "BareScript"
  "Major mode for editing BareScript files"

  ;; Change single quote syntax to behave like double quotes
  (modify-syntax-entry ?' "\"" barescript-mode-syntax-table)

  ;; Ensure double quotes are treated as string delimiters
  (modify-syntax-entry ?\" "\"" barescript-mode-syntax-table)

  ;; Ensure backslashes are treated as escape characters
  (modify-syntax-entry ?\\ "\\" barescript-mode-syntax-table)

  ;; Specify that comments start with '#'
  (modify-syntax-entry ?# "<" barescript-mode-syntax-table)

  ;; Specify that comments end with a newline
  (modify-syntax-entry ?\n ">" barescript-mode-syntax-table)

  ;; Set comment-related variables
  (setq-local comment-start "#")
  (setq-local comment-start-skip "#+\\s-*")

  ;; Set indentation function
  (setq-local indent-line-function 'barescript-indent-line)

  ;; Apply font-lock rules for syntax highlighting
  (setq-local font-lock-defaults '(barescript-font-lock-keywords))

  ;; Define key bindings
  (define-key barescript-mode-map (kbd "TAB") 'barescript-indent-line)
  (define-key barescript-mode-map (kbd "RET") 'barescript-newline-and-indent)
  (define-key barescript-mode-map (kbd "C-c C-h") 'barescript-open-language)
  (define-key barescript-mode-map (kbd "C-c C-l") 'barescript-open-library)
  (define-key barescript-mode-map (kbd "C-c C-f") 'barescript-open-library-function)
  )

(provide 'barescript-mode)

;;; barescript-mode.el ends here
