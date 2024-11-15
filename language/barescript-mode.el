;;; barescript-mode.el --- Major mode for editing BareScript files

;; Version: 0.8.2

;;; Commentary:

;; To install, add the following to your .emacs file:

;; (package-initialize)
;;
;; (unless (package-installed-p 'barescript-mode)
;;   (let ((mode-file (make-temp-file "barescript-mode")))
;;     (url-copy-file "https://craigahobbs.github.io/bare-script/language/barescript-mode.el" mode-file t)
;;     (package-install-file mode-file)
;;     (delete-file mode-file)))
;; (add-to-list 'auto-mode-alist '("\\.\\(?:bare\\|mds\\)\\'" . barescript-mode))

;;; Code:

(defconst barescript-keywords
  (regexp-opt
   '("async" "break" "continue" "else" "elif" "endfor" "endfunction"
     "endif" "endwhile" "false" "for" "function" "if" "in" "include"
     "jump" "jumpif" "null" "return" "true" "while")
   'symbols)
  )

;; Keywords that should trigger indentation
(defconst barescript-indent-keywords
  '("if" "elif" "else" "for" "while" "function")
  "Keywords that trigger indentation when followed by a colon.")

(defconst barescript-font-lock-keywords
  (list
   (cons barescript-keywords 'font-lock-keyword-face)

   ;; Rule for variable assignment highlighting
   '("^\\s-*\\([_A-Za-z][_A-Za-z0-9]*\\)\\s-*=" 1 'font-lock-variable-name-face)

   ;; Rule for label highlighting
   '("^\\s-*\\([_A-Za-z][_A-Za-z0-9]*\\)\\s-*:\\s-*$" 1 'font-lock-constant-face)
   )
  )

(defun barescript-should-indent-next-line ()
  "Return t if current line should trigger indentation."
  (save-excursion
    (beginning-of-line)
    (and (looking-at ".*:\\s-*$")
         (cl-some (lambda (keyword)
                   (looking-at (concat ".*\\b" keyword "\\b.*:\\s-*$")))
                 barescript-indent-keywords))))

(defun barescript-previous-indentation ()
  "Get indentation of previous non-empty line."
  (save-excursion
    (forward-line -1)
    (while (and (not (bobp))
                (looking-at "^\\s-*\\(?:$\\|#\\)"))
      (forward-line -1))
    (current-indentation)))

(defun barescript-indent-line ()
  "Indent current line according to BareScript rules."
  (interactive)
  (let* ((cur (current-indentation))
         (prev (barescript-previous-indentation))
         (default (if (save-excursion
                       (forward-line -1)
                       (barescript-should-indent-next-line))
                     (+ prev tab-width)
                   prev)))
    (indent-line-to
     (cond ((< (point) (+ (line-beginning-position) (current-indentation))) cur)
           ((= cur 0) default)
           ((> cur default) (- default tab-width))
           ((> cur (- default tab-width)) (+ default tab-width))
           (t (max 0 (- cur tab-width)))))))

(defun barescript-newline-and-indent ()
  "Insert newline and indent the new line."
  (interactive)
  (delete-horizontal-space t)
  (newline)
  (barescript-indent-line))

(defun barescript-open-language ()
  "Open BareScript language documentation"
  (interactive)
  (browse-url "https://craigahobbs.github.io/bare-script/language/")
  )

(defun barescript-open-markdownup-library ()
  "Open MarkdownUp library documentation"
  (interactive)
  (browse-url "https://craigahobbs.github.io/markdown-up/library/")
  )

(defun barescript-open-markdownup-include ()
  "Open MarkdownUp include library documentation"
  (interactive)
  (browse-url "https://craigahobbs.github.io/markdown-up/library/include.html")
  )

(defun barescript-open-markdownup-library-function ()
  "Open MarkdownUp library documentation for the function at point"
  (interactive)
  (let* ((library-url "https://craigahobbs.github.io/markdown-up/library/#var.vName='%s'")
         (word-at-point (thing-at-point 'symbol))
         (formatted-url (format library-url word-at-point)))
    (if word-at-point (browse-url formatted-url)
      (message "No BareScript function at point"))
    )
  )

(defun barescript-open-markdownup-include-function ()
  "Open MarkdownUp include library documentation for the function at point"
  (interactive)
  (let* ((library-url "https://craigahobbs.github.io/markdown-up/library/include.html#var.vName='%s'")
         (word-at-point (thing-at-point 'symbol))
         (formatted-url (format library-url word-at-point)))
    (if word-at-point (browse-url formatted-url)
      (message "No BareScript function at point"))
    )
  )

;;;###autoload
(define-derived-mode barescript-mode prog-mode "BareScript"
  "Major mode for editing BareScript files"

  ; Change single quote syntax to behave like double quotes
  (modify-syntax-entry ?' "\"" barescript-mode-syntax-table)

  ; Ensure double quotes are treated as string delimiters
  (modify-syntax-entry ?\" "\"" barescript-mode-syntax-table)

  ; Ensure backslashes are treated as escape characters
  (modify-syntax-entry ?\\ "\\" barescript-mode-syntax-table)

  ; Specify that comments start with '#'
  (modify-syntax-entry ?# "<" barescript-mode-syntax-table)

  ; Specify that comments end with a newline
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
  (define-key barescript-mode-map (kbd "C-c C-l") 'barescript-open-markdownup-library)
  (define-key barescript-mode-map (kbd "C-c C-n") 'barescript-open-markdownup-include)
  (define-key barescript-mode-map (kbd "C-c C-f") 'barescript-open-markdownup-library-function)
  (define-key barescript-mode-map (kbd "C-c C-i") 'barescript-open-markdownup-include-function)
  )

(provide 'barescript-mode)

;;; barescript-mode.el ends here
