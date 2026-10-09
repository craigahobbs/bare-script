;;; barescript-mode.el --- Major mode for editing BareScript files  -*- lexical-binding: t; -*-

;; Author: Craig A. Hobbs
;; URL: https://github.com/craigahobbs/bare-script
;; Version: 1.0
;; Package-Requires: ((emacs "24.4"))
;; Keywords: languages

;;; Commentary:

;; To install, add the following to your .emacs file:

;; (unless (package-installed-p 'barescript-mode)
;;   (let ((mode-file (make-temp-file "barescript-mode" nil ".el")))
;;     (url-copy-file "https://craigahobbs.github.io/bare-script/language/barescript-mode.el" mode-file t)
;;     (package-install-file mode-file)
;;     (delete-file mode-file)))

;;; Code:

(defgroup barescript nil
  "Major mode for editing BareScript files."
  :group 'languages)

(defcustom barescript-indent-offset 4
  "Number of columns for each BareScript indentation level."
  :type 'integer
  :safe 'integerp)

(defconst barescript-keywords
  (regexp-opt
   '("async" "break" "continue" "else" "elif" "endfor" "endfunction"
     "endif" "endwhile" "false" "for" "function" "if" "in" "include"
     "jump" "jumpif" "null" "return" "true" "while")
   'symbols))

(defconst barescript-font-lock-keywords
  (list
   (cons barescript-keywords 'font-lock-keyword-face)

   ;; Rule for function definition name highlighting
   '("\\_<function\\s-+\\([_A-Za-z][_A-Za-z0-9]*\\)" 1 'font-lock-function-name-face)

   ;; Rule for foreach variable highlighting
   '("^\\s-*for\\s-+\\([_A-Za-z][_A-Za-z0-9]*\\)\\(?:\\s-*,\\s-*\\([_A-Za-z][_A-Za-z0-9]*\\)\\)?\\s-+in\\_>"
     (1 'font-lock-variable-name-face) (2 'font-lock-variable-name-face nil t))

   ;; Rule for variable assignment highlighting
   '("^\\s-*\\([_A-Za-z][_A-Za-z0-9]*\\)\\s-*=\\(?:[^=]\\|$\\)" 1 'font-lock-variable-name-face)

   ;; Rule for label highlighting
   '("^\\s-*\\([_A-Za-z][_A-Za-z0-9]*\\)\\s-*:\\s-*\\(?:#.*\\)?$" 1 'font-lock-constant-face)))

(defvar barescript-mode-syntax-table
  (let ((table (make-syntax-table)))
    ;; Single and double quotes are string delimiters
    (modify-syntax-entry ?' "\"" table)
    (modify-syntax-entry ?\" "\"" table)

    ;; Backslashes are escape characters
    (modify-syntax-entry ?\\ "\\" table)

    ;; Comments start with '#' and end with a newline
    (modify-syntax-entry ?# "<" table)
    (modify-syntax-entry ?\n ">" table)
    table)
  "Syntax table for `barescript-mode'.")

(defvar barescript-mode-map
  (let ((map (make-sparse-keymap)))
    (define-key map (kbd "TAB") 'barescript-indent-line)
    (define-key map (kbd "RET") 'barescript-newline-and-indent)
    (define-key map (kbd "DEL") 'barescript-delete-backward-char)
    (define-key map (kbd "M-^") 'barescript-delete-indentation)
    (define-key map (kbd "M-q") 'fill-paragraph)
    (define-key map (kbd "C-c C-h") 'barescript-open-language)
    (define-key map (kbd "C-c C-l") 'barescript-open-library)
    (define-key map (kbd "C-c C-f") 'barescript-open-library-function)
    map)
  "Keymap for `barescript-mode'.")

(defconst barescript--block-start-regexp
  "[ \t]*\\(?:async[ \t]+\\)?\\(?:if\\|for\\|while\\|function\\)[ \t]"
  "Regular expression matching the start of a block statement.
The keyword must be followed by whitespace, which excludes calls to the
built-in \"if\" function.")

(defconst barescript--block-middle-regexp
  "[ \t]*\\_<\\(?:elif\\|else\\)\\_>"
  "Regular expression matching the start of a block's middle statement.")

(defconst barescript--block-end-regexp
  "[ \t]*\\_<\\(?:endif\\|endfor\\|endwhile\\|endfunction\\)\\_>"
  "Regular expression matching the start of a block's end statement.")

(defun barescript--code-line-p ()
  "Return non-nil if the current line isn't blank or only a comment."
  (save-excursion
    (beginning-of-line)
    (not (looking-at "[ \t]*\\(?:#.*\\)?$"))))

(defun barescript--previous-code-line ()
  "Move point to the beginning of the previous code line.
Blank and comment lines are skipped.  Return nil, without moving point,
if there is no previous code line."
  (let ((start (point))
        found)
    (while (and (not found) (= (forward-line -1) 0))
      (setq found (barescript--code-line-p)))
    (unless found
      (goto-char start))
    found))

(defun barescript--line-syntax (pos)
  "Return the syntax state at POS, parsed from the beginning of its line.
BareScript strings and comments don't span lines, so parsing from the
line's beginning is accurate.  It's also much faster than `syntax-ppss',
which is slow when called at positions moving backward in the buffer."
  (save-excursion
    (goto-char pos)
    (parse-partial-sexp (line-beginning-position) pos)))

(defun barescript--next-code-line ()
  "Move point to the beginning of the next code line.
Blank and comment lines are skipped.  Return nil, without moving point,
if there is no next code line."
  (let ((start (point))
        found)
    (while (and (not found) (= (forward-line 1) 0) (not (eobp)))
      (setq found (barescript--code-line-p)))
    (unless found
      (goto-char start))
    found))

(defun barescript--in-string-or-comment-p (pos)
  "Return non-nil if POS is within a string or comment."
  (nth 8 (barescript--line-syntax pos)))

(defun barescript--block-opener-p ()
  "Return non-nil if the current line opens a block (ends with a colon)."
  (save-excursion
    (end-of-line)
    ;; Skip back over a trailing comment
    (let ((state (barescript--line-syntax (point))))
      (when (nth 4 state)
        (goto-char (nth 8 state))))
    (skip-chars-backward " \t")
    (and (eq (char-before) ?:)
         (not (barescript--in-string-or-comment-p (1- (point)))))))

(defun barescript--continued-line-p ()
  "Return non-nil if the current line ends with a line continuation."
  (save-excursion
    (end-of-line)
    (skip-chars-backward " \t")
    (and (eq (char-before) ?\\)
         (not (barescript--in-string-or-comment-p (1- (point)))))))

(defun barescript--operator-continued-line-p ()
  "Return non-nil if the current line ends with an operator and a \"\\\".
For example, a line ending with \"+ \\\" or \": \\\".  The line must end
with a line continuation (see `barescript--continued-line-p'), so the
operator isn't within a string or comment."
  (save-excursion
    (beginning-of-line)
    (looking-at ".*[-+*/%&|^<>=:][ \t]*\\\\[ \t]*$")))

(defun barescript--statement-start ()
  "Move point to the first line of the (possibly continued) statement at point.
Comment lines within a continued statement are skipped."
  (beginning-of-line)
  (let (done)
    (while (not done)
      (let ((line-start (point)))
        (unless (and (barescript--previous-code-line) (barescript--continued-line-p))
          (goto-char line-start)
          (setq done t))))))

(defun barescript--statement-opener-p ()
  "Return non-nil if the statement starting on the current line opens a block.
A block statement is an \"if\", \"elif\", \"else\", \"for\", \"while\", or
\"function\" statement ending with a colon."
  (save-excursion
    (and (or (looking-at barescript--block-start-regexp)
             (looking-at barescript--block-middle-regexp))
         (progn
           (while (and (barescript--continued-line-p) (barescript--next-code-line)))
           (barescript--block-opener-p)))))

(defun barescript--block-indentation ()
  "Return the indentation of the block statement closed by the current line.
For example, an \"endif\" line's block statement is its \"if\" (or \"elif\"
or \"else\") statement.  Return nil if there is no such statement."
  (save-excursion
    (beginning-of-line)
    (let ((depth 0)
          result)
      (while (and (not result) (barescript--previous-code-line))
        (barescript--statement-start)
        (cond ((looking-at barescript--block-end-regexp)
               (setq depth (1+ depth)))
              ((and (looking-at barescript--block-start-regexp) (barescript--statement-opener-p))
               (if (= depth 0)
                   (setq result (current-indentation))
                 (setq depth (1- depth))))
              ((and (= depth 0) (looking-at barescript--block-middle-regexp))
               (setq result (current-indentation)))))
      result)))

(defun barescript--closer-line-p ()
  "Return non-nil if the current line starts with a block closer or bracket."
  (save-excursion
    (beginning-of-line)
    (or (looking-at barescript--block-middle-regexp)
        (looking-at barescript--block-end-regexp)
        (looking-at "[ \t]*[])}]"))))

(defun barescript--statement-lines (statement-start line-start)
  "Parse the statement's code lines from STATEMENT-START to LINE-START.
Return a list whose first item is the parse state at LINE-START, followed
by the code lines, last line first.  Each line is a list of its beginning
position, its starting bracket depth, and its ending bracket depth.
Bracket depths are relative to the statement's start.

The statement is parsed forward in a single pass, which is much faster
than calling `syntax-ppss' for each line in reverse."
  (save-excursion
    (goto-char statement-start)
    (let ((state (parse-partial-sexp statement-start statement-start))
          lines)
      (while (< (point) line-start)
        (let ((line-beginning (point))
              (start-depth (car state))
              (code-line (barescript--code-line-p)))
          (forward-line 1)
          (setq state (parse-partial-sexp line-beginning (point) nil nil state))
          (when code-line
            (push (list line-beginning start-depth (car state)) lines))))
      (cons state lines))))

(defun barescript--continuation-indentation (line-start)
  "Return the expected indentation of the continuation line at LINE-START.
Point must be at the beginning of the previous code line, which ends with
a line continuation."
  (let* ((statement-start (save-excursion (barescript--statement-start) (point)))
         (statement-lines (barescript--statement-lines statement-start line-start))
         (state (car statement-lines))
         (lines (cdr statement-lines))
         (depth (car state))
         (bracket (and (save-excursion (goto-char line-start) (looking-at "[ \t]*[])}]"))
                       (nth 1 state)))
         (operator (barescript--operator-continued-line-p)))
    (cond
     ;; A closing bracket lines up with the line of its open bracket
     (bracket
      (goto-char bracket)
      (current-indentation))

     ;; Indent past a line that leaves a bracket open
     ((> depth (nth 1 (car lines)))
      (+ (current-indentation) barescript-indent-offset))

     (t
      ;; Find the first line of the current line's element - an element is a bracketed value (e.g. an
      ;; array item or function argument) or the statement itself, and it continues to the following
      ;; line if the line ends with an operator
      (let ((element (car lines))
            (previous-lines (cdr lines)))
        (while (and previous-lines
                    (let ((end-depth (nth 2 (car previous-lines))))
                      (or (> end-depth depth)
                          (and (= end-depth depth)
                               (save-excursion
                                 (goto-char (car (car previous-lines)))
                                 (barescript--operator-continued-line-p))))))
          (setq element (car previous-lines)
                previous-lines (cdr previous-lines)))
        (goto-char (car element)))
      (cond
       ;; The statement's continuation is indented one level - two levels for a block statement, to
       ;; set it apart from the block's body
       ((= (point) statement-start)
        (+ (current-indentation)
           (if (or (looking-at barescript--block-start-regexp)
                   (looking-at barescript--block-middle-regexp))
               (* 2 barescript-indent-offset)
             barescript-indent-offset)))

       ;; A multi-line element (the previous line ends with an operator) is indented one level
       (operator
        (+ (current-indentation) barescript-indent-offset))

       ;; A new element lines up with the previous element
       (t
        (current-indentation)))))))

(defun barescript--expected-indentation ()
  "Return the expected indentation of the current line.
See `barescript-mode' for the indentation rules."
  (save-excursion
    (beginning-of-line)
    (let ((line-start (point))
          (block-indentation (and (or (looking-at barescript--block-middle-regexp)
                                      (looking-at barescript--block-end-regexp))
                                  (barescript--block-indentation))))
      (cond
       ;; A comment line before an "elif" or "else" lines up with it
       ((and (looking-at "[ \t]*#")
             (save-excursion
               (and (re-search-forward "^[ \t]*[^ \t\n#]" nil t)
                    (progn (beginning-of-line) (looking-at barescript--block-middle-regexp)))))
        (re-search-forward "^[ \t]*[^ \t\n#]")
        (barescript--expected-indentation))

       ;; First code line
       ((not (barescript--previous-code-line))
        0)

       ;; Continuation line
       ((barescript--continued-line-p)
        (barescript--continuation-indentation line-start))

       ;; A block closer lines up with its block statement
       (block-indentation
        block-indentation)

       ;; New statement - line up with the previous statement, or indent past a block statement
       (t
        (let ((opener (barescript--block-opener-p)))
          (barescript--statement-start)
          (if (and opener (barescript--statement-opener-p))
              (+ (current-indentation) barescript-indent-offset)
            (current-indentation))))))))

(defun barescript--electric-indent-p (char)
  "Return non-nil if inserting CHAR should re-indent the current line.
This is the case if CHAR completes a block closer keyword (e.g. \"endif\")
at the start of the line, or extends one into an identifier, or if CHAR
is a closing bracket at the start of the line."
  (save-excursion
    (let ((bol (line-beginning-position)))
      (if (memq char '(?\] ?\) ?\}))
          (progn
            (backward-char)
            (skip-chars-backward " \t")
            (= (point) bol))
        (looking-back "^[ \t]*\\(?:elif\\|else\\|endif\\|endfor\\|endwhile\\|endfunction\\)\\(?:\\sw\\|\\s_\\)?"
                      bol)))))

(defun barescript-indent-line ()
  "Indent the current line to its expected indentation.
If the line is already at its expected indentation, or this command is
repeated, indent the line one level out instead, wrapping from column
zero to one level past the expected indentation.  If the region is
active, re-indent the region.  See `barescript-mode' for the indentation
rules."
  (interactive)
  (if (use-region-p)
      (indent-region (region-beginning) (region-end))
    (let ((cur (current-indentation))
          (expected (barescript--expected-indentation)))
      (barescript--indent-line-to
       (cond ((not (or (= cur expected) (eq last-command 'barescript-indent-line))) expected)
             ((= cur 0) (+ expected barescript-indent-offset))
             (t (* barescript-indent-offset (/ (1- cur) barescript-indent-offset))))))))

(defun barescript--indent-line ()
  "Indent the current line to its expected indentation.
This is the `indent-line-function', used by `indent-region' and electric
indentation.  Unlike `barescript-indent-line', it never cycles."
  (barescript--indent-line-to (barescript--expected-indentation)))

(defun barescript--indent-line-to (column)
  "Indent the current line to COLUMN, keeping point's position in its text."
  (let ((text-column (- (current-column) (current-indentation))))
    (indent-line-to column)
    (when (> text-column 0)
      (move-to-column (+ column text-column)))))

(defun barescript--continuation-needed-p ()
  "Return non-nil if a newline at point requires a \"\\\" line continuation.
That is the case if point follows code within an open bracket, or follows
an operator, and isn't within a string or comment."
  (let ((line-state (barescript--line-syntax (point))))
    (and (not (nth 8 line-state))
         (save-excursion (skip-chars-backward " \t") (not (bolp)))
         (not (memq (char-before) '(?\\)))
         (not (save-excursion (beginning-of-line) (looking-at "[ \t]*include\\_>")))
         ;; Check from cheapest to most expensive - the statement is only parsed if the line continues one
         (or (memq (char-before) '(?- ?+ ?* ?/ ?% ?& ?| ?^ ?< ?> ?=))
             (> (car line-state) 0)
             (and (save-excursion (and (barescript--previous-code-line) (barescript--continued-line-p)))
                  (> (car (save-excursion
                            (parse-partial-sexp (save-excursion (barescript--statement-start) (point)) (point))))
                     0))))))

(defun barescript-newline-and-indent ()
  "Insert a newline and indent the new line to its expected indentation.
Within an open bracket, or after an operator, a \"\\\" line continuation is
added.  If the current line starts with a block closer (e.g. \"endif\")
or a closing bracket, it is first indented to its expected indentation.
See `barescript-mode' for the indentation rules."
  (interactive)
  (delete-horizontal-space t)
  (when (barescript--continuation-needed-p)
    (insert " \\"))
  (when (barescript--closer-line-p)
    (save-excursion (indent-line-to (barescript--expected-indentation))))
  (newline)
  (indent-line-to (barescript--expected-indentation)))

(defun barescript--join-continued-line ()
  "Join the current line to the previous line, removing its line continuation.
The previous line must end with a \"\\\" line continuation.  Return the
position of the join."
  (let ((end (save-excursion (back-to-indentation) (point)))
        (start (save-excursion
                 (forward-line -1)
                 (end-of-line)
                 (skip-chars-backward " \t")
                 (backward-char)
                 (skip-chars-backward " \t")
                 (point))))
    (delete-region start end)
    (goto-char start)
    (unless (or (memq (char-before) '(?\[ ?\( ?\{))
                (memq (char-after) '(?\] ?\) ?\}))
                (eolp))
      (insert " "))
    start))

(defun barescript--previous-line-continued-p ()
  "Return non-nil if the previous line ends with a \"\\\" line continuation."
  (save-excursion
    (and (= (forward-line -1) 0)
         (barescript--continued-line-p))))

(defun barescript-delete-backward-char (n)
  "Delete the previous N characters.
If only indentation precedes point and the previous line ends with a
\"\\\" line continuation, join the line to the previous line instead,
removing the line continuation."
  (interactive "p")
  (if (and (= n 1)
           (not (use-region-p))
           (save-excursion (skip-chars-backward " \t") (bolp))
           (barescript--previous-line-continued-p))
      (barescript--join-continued-line)
    (call-interactively 'delete-backward-char)))

(defun barescript-delete-indentation (&optional arg)
  "Join this line to the previous line, like `delete-indentation'.
With ARG, join the next line to this line.  If the previous line ends
with a \"\\\" line continuation, it is removed."
  (interactive "*P")
  (if (and arg (save-excursion (end-of-line) (eobp)))
      (delete-indentation arg)
    (when arg
      (forward-line 1))
    (if (barescript--previous-line-continued-p)
        (goto-char (barescript--join-continued-line))
      (delete-indentation))))

(defun barescript--fill-break (eol)
  "Return the (START . END) whitespace to break the current line at, or nil.
Point must be after the line's indentation.  The break is the last
whitespace (outside strings) before EOL that leaves room for a \" \\\"
continuation within `fill-column', else the first such whitespace."
  (let (break done)
    (while (and (not done) (re-search-forward "[ \t]+" eol t))
      (let ((space (cons (match-beginning 0) (match-end 0))))
        (unless (or (= (cdr space) eol) (barescript--in-string-or-comment-p (car space)))
          (if (<= (+ (save-excursion (goto-char (car space)) (current-column)) 2) fill-column)
              (setq break space)
            (setq done t)
            (unless break
              (setq break space))))))
    break))

(defun barescript--fill-statement ()
  "Fill the code statement at point using \" \\\" line continuations.
Return nil, without filling, if the statement contains a comment."
  (let* ((start (save-excursion (barescript--statement-start) (point)))
         (end (save-excursion
                (goto-char start)
                (while (and (barescript--continued-line-p) (= (forward-line 1) 0)))
                (copy-marker (line-end-position)))))
    (unless (save-excursion (goto-char start) (comment-search-forward end t))
      ;; Join the statement's continued lines
      (goto-char start)
      (while (and (barescript--continued-line-p) (< (line-end-position) end))
        (forward-line 1)
        (barescript--join-continued-line))

      ;; Break the statement's lines that are longer than fill-column
      (goto-char start)
      (let (break)
        (while (and (progn (end-of-line) (> (current-column) fill-column))
                    (progn (back-to-indentation) (setq break (barescript--fill-break (line-end-position)))))
          (delete-region (car break) (cdr break))
          (goto-char (car break))
          (insert " \\\n")
          (indent-line-to (barescript--expected-indentation))))
      t)))

(defun barescript-fill-paragraph (&optional justify)
  "Fill the comment or code statement at point.
Code statements are filled using \" \\\" line continuations.  JUSTIFY is
passed to `fill-comment-paragraph'."
  (save-excursion
    (or (and (not (nth 4 (barescript--line-syntax (point))))
             (not (save-excursion (beginning-of-line) (looking-at "\\s-*#")))
             (barescript--fill-statement))
        (fill-comment-paragraph justify)
        t)))

(defun barescript-open-language ()
  "Open the BareScript language documentation."
  (interactive)
  (browse-url "https://craigahobbs.github.io/bare-script/language/"))

(defun barescript-open-library ()
  "Open the BareScript library documentation."
  (interactive)
  (browse-url "https://craigahobbs.github.io/bare-script/library/"))

(defun barescript-open-library-function ()
  "Open the BareScript library documentation for the function at point."
  (interactive)
  (let ((function-name (thing-at-point 'symbol t)))
    (if function-name
        (browse-url (format "https://craigahobbs.github.io/bare-script/library/#var.vName='%s'" function-name))
      (message "No BareScript function at point"))))

;;;###autoload
(define-derived-mode barescript-mode prog-mode "BareScript"
  "Major mode for editing BareScript files.

Indentation:

- A statement lines up with the previous statement.  After a block
  statement (\"if\", \"elif\", \"else\", \"for\", \"while\", \"function\"),
  the next line is indented one level.  A block closer (\"elif\", \"else\",
  \"endif\", \"endfor\", \"endwhile\", \"endfunction\") lines up with its
  block statement.  Comments are indented like code, except that a
  comment before an \"elif\" or \"else\" lines up with it.

- A statement continued with \"\\\" is indented one level (two levels for
  a block statement).  After a line that leaves a bracket open, the next
  line is indented one level, and a closing bracket lines up with the
  line of its open bracket.  Within brackets, a value continued after an
  operator (e.g. \"+ \\\") is indented one level, and the next value lines
  up with the previous value.

- RET indents the new line.  Block closers and closing brackets are
  re-indented as they're typed, and by RET.

- RET within an open bracket, or after an operator, adds a \"\\\" line
  continuation.  \\[barescript-delete-backward-char] in the indentation of a continued line, or
  \\[barescript-delete-indentation], joins it to the previous line, removing the line
  continuation.

- TAB indents the line.  If the line is already indented, or TAB is
  pressed again, it moves the line one level out, wrapping from column
  zero to one level past the line's indentation.

- \\[fill-paragraph] fills comments, and fills code statements using \"\\\"
  line continuations.

\\{barescript-mode-map}"

  ;; Set comment-related variables
  (setq-local comment-start "# ")
  (setq-local comment-start-skip "#+\\s-*")

  ;; Fill comments and code statements (auto-fill comments only)
  (setq-local fill-paragraph-function 'barescript-fill-paragraph)
  (setq-local comment-auto-fill-only-comments t)

  ;; Set indentation function, and re-indent block closers and closing brackets as they're typed
  (setq-local indent-line-function 'barescript--indent-line)
  (add-hook 'electric-indent-functions 'barescript--electric-indent-p nil t)

  ;; Apply font-lock rules for syntax highlighting
  (setq-local font-lock-defaults '(barescript-font-lock-keywords)))

;;;###autoload
(add-to-list 'auto-mode-alist '("\\.bare\\'" . barescript-mode))

(provide 'barescript-mode)

;;; barescript-mode.el ends here
