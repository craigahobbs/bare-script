;;; barescript-mode-test.el --- Unit tests for barescript-mode  -*- lexical-binding: t; -*-

;;; Commentary:

;; Run the tests (from the bare-script-py repository):
;;
;; make test-emacs
;; make test-emacs TEST=barescript-test-tab

;;; Code:

(require 'ert)
(require 'barescript-mode)


;;
;; Test helpers
;;

(defmacro barescript-test-with-buffer (text &rest body)
  "Run BODY in a `barescript-mode' buffer containing TEXT.
Point is placed at the \"|\" in TEXT (which is removed), or at the
beginning of the buffer."
  (declare (indent 1))
  ;; Inhibit messages - in batch mode, they (and each keyboard macro key's echo area clear) print to the
  ;; test output
  `(let ((buffer (generate-new-buffer "*barescript-test*"))
         (inhibit-message t))
     (unwind-protect
         (progn
           ;; Keyboard macros execute in the selected window's buffer
           (switch-to-buffer buffer)
           (barescript-mode)
           (setq-local indent-tabs-mode nil)
           (setq-local fill-column 40)
           (insert ,text)
           (goto-char (point-min))
           (when (search-forward "|" nil t)
             (delete-char -1))
           ,@body)
       (kill-buffer buffer))))

(defun barescript-test-keys (keys)
  "Press KEYS (a `kbd' string) in the current buffer."
  (execute-kbd-macro (kbd keys)))

(defun barescript-test-buffer ()
  "Return the current buffer's text with a \"|\" at point."
  (concat (buffer-substring-no-properties (point-min) (point))
          "|"
          (buffer-substring-no-properties (point) (point-max))))

(defun barescript-test-tab-indents (count)
  "Press TAB COUNT times, returning the line's indentation after each press."
  (let* (indents
         (record (lambda ()
                   (when (eq this-command 'barescript-indent-line)
                     (push (current-indentation) indents)))))
    (add-hook 'post-command-hook record nil t)
    (unwind-protect
        (barescript-test-keys (mapconcat #'identity (make-list count "TAB") " "))
      (remove-hook 'post-command-hook record t))
    (nreverse indents)))

(defun barescript-test-type (keys)
  "Type KEYS (a string of characters) in a new buffer, one key at a time.
Return the buffer's text with a \"|\" at point."
  (barescript-test-with-buffer ""
    (execute-kbd-macro keys)
    (barescript-test-buffer)))

(defun barescript-test-face (text needle)
  "Return the face of the first occurrence of NEEDLE in fontified TEXT."
  (barescript-test-with-buffer text
    (font-lock-ensure)
    (search-forward needle)
    (get-text-property (match-beginning 0) 'face)))


;;
;; Mode setup
;;

(ert-deftest barescript-test-auto-mode ()
  (should (eq (assoc-default "test.bare" auto-mode-alist #'string-match) 'barescript-mode)))

(ert-deftest barescript-test-key-bindings ()
  (barescript-test-with-buffer ""
    (should (eq (key-binding (kbd "TAB")) 'barescript-indent-line))
    (should (eq (key-binding (kbd "RET")) 'barescript-newline-and-indent))
    (should (eq (key-binding (kbd "M-q")) 'fill-paragraph))))

(ert-deftest barescript-test-comment-region ()
  (barescript-test-with-buffer "x = 1"
    (comment-region (point-min) (point-max))
    (should (equal (buffer-string) "# x = 1"))))


;;
;; Font lock
;;

(ert-deftest barescript-test-font-lock ()
  (should (eq (barescript-test-face "if x:\n" "if") 'font-lock-keyword-face))
  (should (eq (barescript-test-face "async function getIt(a):\n" "getIt") 'font-lock-function-name-face))
  (should (eq (barescript-test-face "    foo = 1\n" "foo") 'font-lock-variable-name-face))
  (should (eq (barescript-test-face "for value, ix in values:\n" "value") 'font-lock-variable-name-face))
  (should (eq (barescript-test-face "for value, ix in values:\n" "ix") 'font-lock-variable-name-face))
  (should (eq (barescript-test-face "loop:\n" "loop") 'font-lock-constant-face))
  (should (eq (barescript-test-face "loop:  # comment\n" "loop") 'font-lock-constant-face))
  (should (eq (barescript-test-face "x = 'a#b'\n" "a#b") 'font-lock-string-face))
  (should (eq (barescript-test-face "x = 1  # comment\n" "comment") 'font-lock-comment-face)))

(ert-deftest barescript-test-font-lock-equality-not-assignment ()
  (should-not (barescript-test-face "foo == 1\n" "foo")))


;;
;; Indentation - typing code with RET
;;
;; These tests type code one key at a time ("\r" is RET, "\t" is TAB), as a
;; person editing a file would.
;;

(ert-deftest barescript-test-type-statements ()
  (should (equal (barescript-test-type "a = 1\rb = 2")
                 "a = 1\nb = 2|")))

(ert-deftest barescript-test-type-block-openers ()
  (dolist (opener '("if a:" "elif a:" "else:" "for v in a:" "for v, i in a:" "while a:"
                    "function f(a):" "async function f(a):"))
    (should (equal (barescript-test-type (concat opener "\rb = 1"))
                   (concat opener "\n    b = 1|")))))

(ert-deftest barescript-test-type-block-opener-comment ()
  (should (equal (barescript-test-type "if a:  # check\rb = 1")
                 "if a:  # check\n    b = 1|")))

(ert-deftest barescript-test-type-colon-in-string ()
  (should (equal (barescript-test-type "a = 'b:'\rc = 1")
                 "a = 'b:'\nc = 1|")))

(ert-deftest barescript-test-type-colon-in-comment ()
  (should (equal (barescript-test-type "a = 1  # note:\rb = 1")
                 "a = 1  # note:\nb = 1|")))

(ert-deftest barescript-test-type-if-elif-else ()
  (should (equal (barescript-test-type "if a:\rb = 1\relif c:\rb = 2\relse:\rb = 3\rendif\rd = 1")
                 "if a:\n    b = 1\nelif c:\n    b = 2\nelse:\n    b = 3\nendif\nd = 1|")))

(ert-deftest barescript-test-type-block-ends ()
  (dolist (block '(("for v in a:" . "endfor") ("while a:" . "endwhile") ("function f():" . "endfunction")))
    (should (equal (barescript-test-type (concat (car block) "\rb = 1\r" (cdr block) "\rc = 1"))
                   (concat (car block) "\n    b = 1\n" (cdr block) "\nc = 1|")))))

(ert-deftest barescript-test-type-nested-blocks ()
  (should (equal (barescript-test-type (concat "async function main(values):\r"
                                               "sum = 0\r"
                                               "for value in values:\r"
                                               "if value < 0:\r"
                                               "continue\r"
                                               "endif\r"
                                               "while value > 0:\r"
                                               "value = value - 1\r"
                                               "endwhile\r"
                                               "endfor\r"
                                               "return sum\r"
                                               "endfunction\r"
                                               "\r"
                                               "main([1, 2])"))
                 (concat "async function main(values):\n"
                         "    sum = 0\n"
                         "    for value in values:\n"
                         "        if value < 0:\n"
                         "            continue\n"
                         "        endif\n"
                         "        while value > 0:\n"
                         "            value = value - 1\n"
                         "        endwhile\n"
                         "    endfor\n"
                         "    return sum\n"
                         "endfunction\n"
                         "\n"
                         "main([1, 2])|"))))

(ert-deftest barescript-test-type-empty-block ()
  (should (equal (barescript-test-type "if a:\rendif\rb = 1")
                 "if a:\nendif\nb = 1|")))

(ert-deftest barescript-test-type-nested-empty-block ()
  (should (equal (barescript-test-type "if a:\rif b:\relse:\rendif\rendif")
                 "if a:\n    if b:\n    else:\n    endif\nendif|")))

(ert-deftest barescript-test-type-comments ()
  ;; Comment lines are indented like code, and don't affect the following line
  (should (equal (barescript-test-type "if a:\r# Comment\rb = 1\r\r# Comment\rendif")
                 "if a:\n    # Comment\n    b = 1\n\n    # Comment\nendif|")))

(ert-deftest barescript-test-type-blank-lines ()
  ;; Blank lines have no trailing whitespace and don't affect the following line
  (should (equal (barescript-test-type "if a:\r\r\rb = 1")
                 "if a:\n\n\n    b = 1|")))

(ert-deftest barescript-test-type-labels ()
  ;; Labels aren't block statements
  (should (equal (barescript-test-type "if a:\rloop:\rjumpif (i > 9) done\ri = i + 1\rjump loop\rdone:")
                 "if a:\n    loop:\n    jumpif (i > 9) done\n    i = i + 1\n    jump loop\n    done:|")))

(ert-deftest barescript-test-type-continuation ()
  (should (equal (barescript-test-type "x = a + \\\rb + \\\rc\ry = 1")
                 "x = a + \\\n    b + \\\n    c\ny = 1|")))

(ert-deftest barescript-test-type-continuation-brackets ()
  (should (equal (barescript-test-type "colors = [ \\\r'red', \\\r'green' \\\r]\rreturn colors")
                 "colors = [ \\\n    'red', \\\n    'green' \\\n]\nreturn colors|")))

(ert-deftest barescript-test-type-continuation-nested-brackets ()
  (should (equal (barescript-test-type (concat "if a:\r"
                                               "x = dataFilter( \\\r"
                                               "data, \\\r"
                                               "{ \\\r"
                                               "'a': [ \\\r"
                                               "1, \\\r"
                                               "2 \\\r"
                                               "], \\\r"
                                               "'b': 3 \\\r"
                                               "} \\\r"
                                               ")\r"
                                               "endif"))
                 (concat "if a:\n"
                         "    x = dataFilter( \\\n"
                         "        data, \\\n"
                         "        { \\\n"
                         "            'a': [ \\\n"
                         "                1, \\\n"
                         "                2 \\\n"
                         "            ], \\\n"
                         "            'b': 3 \\\n"
                         "        } \\\n"
                         "    )\n"
                         "endif|"))))

(ert-deftest barescript-test-type-continuation-wrapped ()
  ;; A closing bracket mid-line doesn't affect indentation
  (should (equal (barescript-test-type "x = arrayJoin(['a', 'b', \\\r'c'], ',')\ry = 1")
                 "x = arrayJoin(['a', 'b', \\\n    'c'], ',')\ny = 1|")))

(ert-deftest barescript-test-type-continuation-block-opener ()
  ;; A block statement's continuation is indented two levels, to set it apart from the block's body
  (should (equal (barescript-test-type "if a && \\\rb:\rc = 1\rendif")
                 "if a && \\\n        b:\n    c = 1\nendif|")))

(ert-deftest barescript-test-type-continuation-block-end ()
  ;; A block closer after a continued statement lines up with its block statement
  (should (equal (barescript-test-type "if a:\rx = [ \\\r1 \\\r]\rendif")
                 "if a:\n    x = [ \\\n        1 \\\n    ]\nendif|")))

(ert-deftest barescript-test-type-closer-not-keyword ()
  ;; Identifiers that start with a block closer keyword aren't block closers
  (should (equal (barescript-test-type "if a:\rendifCount = 1")
                 "if a:\n    endifCount = 1|"))
  (should (equal (barescript-test-type "if a:\relse_value = 1")
                 "if a:\n    else_value = 1|")))

(ert-deftest barescript-test-type-closer-electric ()
  ;; Block closers are re-indented as they're typed
  (should (equal (barescript-test-type "if a:\rb = 1\rendif")
                 "if a:\n    b = 1\nendif|"))
  (should (equal (barescript-test-type "if a:\rb = 1\relse")
                 "if a:\n    b = 1\nelse|")))

(ert-deftest barescript-test-type-closing-bracket-electric ()
  ;; Closing brackets are re-indented as they're typed
  (should (equal (barescript-test-type "x = [ \\\r1 \\\r]")
                 "x = [ \\\n    1 \\\n]|")))


(ert-deftest barescript-test-type-continuation-block-bracket ()
  ;; A block statement line that leaves a bracket open indents its contents one level
  (should (equal (barescript-test-type "for v in [ \\\r1, \\\r2 \\\r]:\rx = v\rendfor")
                 "for v in [ \\\n    1, \\\n    2 \\\n]:\n    x = v\nendfor|")))

(ert-deftest barescript-test-type-continuation-value ()
  ;; A value continued after an operator is indented one level - the next value lines up with the previous
  (should (equal (barescript-test-type "x = [ \\\r'a', \\\r'b' + \\\r'c' + \\\r'd', \\\r'e' \\\r]")
                 "x = [ \\\n    'a', \\\n    'b' + \\\n        'c' + \\\n        'd', \\\n    'e' \\\n]|")))

(ert-deftest barescript-test-type-continuation-value-nested ()
  ;; A continued value containing a bracketed value
  (should (equal (barescript-test-type "x = [ \\\r'a' + \\\rf(b, \\\rc) + \\\r'd', \\\r'e' \\\r]")
                 "x = [ \\\n    'a' + \\\n        f(b, \\\n            c) + \\\n        'd', \\\n    'e' \\\n]|")))

(ert-deftest barescript-test-type-continuation-close-mid-line ()
  ;; After a line that closes a bracket mid-line, the next value lines up with the bracket's value
  (should (equal (barescript-test-type "x = [ \\\r{'a': 1, \\\r'b': 2}, \\\r'c' \\\r]")
                 "x = [ \\\n    {'a': 1, \\\n        'b': 2}, \\\n    'c' \\\n]|")))

(ert-deftest barescript-test-type-continuation-previous-value ()
  ;; A value lines up with the previous value, even if it's indented differently
  (barescript-test-with-buffer "x = [ \\\n            'a', \\|"
    (execute-kbd-macro "\r'b' \\\r]")
    (should (equal (barescript-test-buffer) "x = [ \\\n            'a', \\\n            'b' \\\n]|"))))

(ert-deftest barescript-test-type-builtin-if ()
  ;; The built-in "if" function isn't a block statement
  (should (equal (barescript-test-type "if(a, \\\rb, c)\rd = 1")
                 "if(a, \\\n    b, c)\nd = 1|")))


;;
;; Indentation - RET
;;

(ert-deftest barescript-test-ret-trailing-whitespace ()
  (barescript-test-with-buffer "a = 1   |"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "a = 1\n|"))))

(ert-deftest barescript-test-ret-split-line ()
  (barescript-test-with-buffer "if a:|b = 1"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "if a:\n    |b = 1"))))

(ert-deftest barescript-test-ret-split-block-end ()
  (barescript-test-with-buffer "if a:\n    b = 1|endif"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "if a:\n    b = 1\n|endif"))))

(ert-deftest barescript-test-ret-beginning-of-line ()
  ;; RET at the beginning of a line opens a blank line above it
  (barescript-test-with-buffer "if a:\n    |b = 1\nendif"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "if a:\n\n    |b = 1\nendif"))))

(ert-deftest barescript-test-ret-keeps-manual-indentation ()
  ;; RET doesn't re-indent the current line, unless it's a closer
  (barescript-test-with-buffer "if a:\n        b = 1|"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "if a:\n        b = 1\n        |"))))

(ert-deftest barescript-test-ret-reindents-block-closer ()
  (barescript-test-with-buffer "if a:\n    b = 1\n        endif|"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "if a:\n    b = 1\nendif\n|"))))


;;
;; Line continuations - RET, DEL, and M-^
;;

(ert-deftest barescript-test-continuation-type-list ()
  ;; Typing a multi-line list needs no "\" - RET adds them
  (should (equal (barescript-test-type "x = [\r'a',\r'b'\r]\ry = 1")
                 "x = [ \\\n    'a', \\\n    'b' \\\n]\ny = 1|")))

(ert-deftest barescript-test-continuation-type-nested ()
  (should (equal (barescript-test-type "x = foo(\r{\r'a': [1, 2],\r'b':\r3\r}\r)")
                 "x = foo( \\\n    { \\\n        'a': [1, 2], \\\n        'b': \\\n            3 \\\n    } \\\n)|")))

(ert-deftest barescript-test-continuation-operator ()
  (should (equal (barescript-test-type "x = 'a' +\r'b'\ry = 1")
                 "x = 'a' + \\\n    'b'\ny = 1|"))
  (should (equal (barescript-test-type "if a &&\rb:\rc = 1")
                 "if a && \\\n        b:\n    c = 1|")))

(ert-deftest barescript-test-continuation-split-line ()
  (barescript-test-with-buffer "x = [1,| 2]"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "x = [1, \\\n    |2]"))))

(ert-deftest barescript-test-continuation-existing ()
  ;; A line that already ends with "\" doesn't get another
  (should (equal (barescript-test-type "x = [ \\\r1 \\\r]")
                 "x = [ \\\n    1 \\\n]|")))

(ert-deftest barescript-test-continuation-not-needed ()
  ;; No "\" after a block statement, a complete statement, a label, or on a blank line
  (should (equal (barescript-test-type "if a:\rb = [1]\rlabel:\rc = f(1)")
                 "if a:\n    b = [1]\n    label:\n    c = f(1)|"))
  (barescript-test-with-buffer "x = [ \\\n    |"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "x = [ \\\n\n    |"))))

(ert-deftest barescript-test-continuation-include ()
  ;; No "\" after an include statement's ">"
  (barescript-test-with-buffer "include <unittest.bare>|"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "include <unittest.bare>\n|"))))

(ert-deftest barescript-test-continuation-string-comment ()
  ;; No "\" within a string or comment
  (barescript-test-with-buffer "x = 'a [|"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "x = 'a [\n|")))
  (barescript-test-with-buffer "x = 1  # a [ +|"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "x = 1  # a [ +\n|"))))

(ert-deftest barescript-test-continuation-unclosed-bracket ()
  ;; An unclosed bracket in an earlier statement doesn't add "\"
  (barescript-test-with-buffer "x = [1\ny = 2|"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "x = [1\ny = 2\n|"))))

(ert-deftest barescript-test-continuation-del ()
  ;; DEL in a continued line's indentation undoes RET
  (barescript-test-with-buffer "x = [|'a']"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "x = [ \\\n    |'a']"))
    (barescript-test-keys "DEL")
    (should (equal (barescript-test-buffer) "x = [|'a']")))
  (barescript-test-with-buffer "foo(a, \\\n  |  b)"
    (barescript-test-keys "DEL")
    (should (equal (barescript-test-buffer) "foo(a, |b)"))))

(ert-deftest barescript-test-continuation-del-other ()
  ;; DEL is unchanged elsewhere
  (barescript-test-with-buffer "if a:\n    |b = 1"
    (barescript-test-keys "DEL")
    (should (equal (barescript-test-buffer) "if a:\n   |b = 1")))
  (barescript-test-with-buffer "x = [ \\\n    'a'|"
    (barescript-test-keys "DEL")
    (should (equal (barescript-test-buffer) "x = [ \\\n    'a|"))))

(ert-deftest barescript-test-continuation-delete-indentation ()
  (barescript-test-with-buffer "x = [ \\\n    'a', \\\n    'b'|]"
    (barescript-test-keys "M-^")
    (should (equal (barescript-test-buffer) "x = [ \\\n    'a',| 'b']"))
    (barescript-test-keys "M-^")
    (should (equal (barescript-test-buffer) "x = [|'a', 'b']")))
  (barescript-test-with-buffer "a = 1\n    |b = 2"
    (barescript-test-keys "M-^")
    (should (equal (barescript-test-buffer) "a = 1| b = 2")))
  ;; With a prefix argument on the last line, there's no next line to join
  (barescript-test-with-buffer "x = [ \\\n    1|"
    (barescript-test-keys "C-u M-^")
    (should (equal (buffer-string) "x = [ \\\n    1"))))


;;
;; Indentation - TAB
;;

(ert-deftest barescript-test-tab-to-expected ()
  ;; TAB indents a line to its expected indentation
  (barescript-test-with-buffer "if a:\n|b = 1\n"
    (should (equal (barescript-test-tab-indents 1) '(4))))
  (barescript-test-with-buffer "if a:\n            |b = 1\n"
    (should (equal (barescript-test-tab-indents 1) '(4)))))

(ert-deftest barescript-test-tab-cycle ()
  ;; TAB on an indented line, or pressed again, moves the line out a level, wrapping from zero
  (barescript-test-with-buffer "if a:\n    if b:\n        |c = 1\n"
    (should (equal (barescript-test-tab-indents 5) '(4 0 12 8 4)))))

(ert-deftest barescript-test-tab-cycle-from-unindented ()
  (barescript-test-with-buffer "if a:\n|b = 1\n"
    (should (equal (barescript-test-tab-indents 4) '(4 0 8 4)))))

(ert-deftest barescript-test-tab-top-level ()
  (barescript-test-with-buffer "a = 1\n|b = 1\n"
    (should (equal (barescript-test-tab-indents 3) '(4 0 4)))))

(ert-deftest barescript-test-tab-first-line ()
  (barescript-test-with-buffer "    |a = 1\n"
    (should (equal (barescript-test-tab-indents 2) '(0 4)))))

(ert-deftest barescript-test-tab-blank-line ()
  (barescript-test-with-buffer "if a:\n    b = 1\n|\n"
    (should (equal (barescript-test-tab-indents 1) '(4)))
    (should (equal (barescript-test-buffer) "if a:\n    b = 1\n    |\n"))))

(ert-deftest barescript-test-tab-block-closer ()
  (barescript-test-with-buffer "if a:\n    b = 1\n    |endif\n"
    (should (equal (barescript-test-tab-indents 1) '(0)))))

(ert-deftest barescript-test-tab-comment ()
  (barescript-test-with-buffer "if a:\n|# Comment\n"
    (should (equal (barescript-test-tab-indents 1) '(4)))))

(ert-deftest barescript-test-tab-continuation-first-line ()
  ;; The first continuation line is one level past the statement's first line
  (barescript-test-with-buffer "    x = [ \\\n        |'a', \\\n        'b']\n"
    (should (equal (barescript-test-tab-indents 4) '(4 0 12 8)))))

(ert-deftest barescript-test-tab-continuation-previous-line ()
  ;; Later continuation lines line up with the previous line
  (barescript-test-with-buffer "    x = [ \\\n            'a', \\\n        |'b']\n"
    (should (equal (barescript-test-tab-indents 6) '(12 8 4 0 16 12)))))

(ert-deftest barescript-test-tab-continuation-closing-bracket ()
  (barescript-test-with-buffer "x = { \\\n    'a': [ \\\n        1 \\\n        |] \\\n}\n"
    (should (equal (barescript-test-tab-indents 1) '(4)))))

(ert-deftest barescript-test-tab-not-repeated ()
  ;; TAB is only "pressed again" if the previous command was TAB
  (barescript-test-with-buffer "if a:\n|b = 1\nc = 1\n"
    (barescript-test-keys "TAB C-n C-a TAB")
    (should (equal (buffer-string) "if a:\n    b = 1\n    c = 1\n"))))

(ert-deftest barescript-test-tab-off-level ()
  ;; Indentation between levels moves out to the next level
  (barescript-test-with-buffer "if a:\n    if b:\n          |c = 1\n"
    (should (equal (barescript-test-tab-indents 2) '(8 4)))))

(ert-deftest barescript-test-tab-point-in-text ()
  ;; Point keeps its position within the line's text
  (barescript-test-with-buffer "if a:\nb = |2\n"
    (barescript-test-keys "TAB")
    (should (equal (barescript-test-buffer) "if a:\n    b = |2\n"))))

(ert-deftest barescript-test-tab-point-in-indentation ()
  ;; Point in the indentation moves to the start of the line's text
  (barescript-test-with-buffer "if a:\n  |  b = 2\n"
    (barescript-test-keys "TAB")
    (should (equal (barescript-test-buffer) "if a:\n|b = 2\n"))))

(ert-deftest barescript-test-tab-indent-tabs-mode ()
  (barescript-test-with-buffer "if a:\n    if b:\n|c = 1\n"
    (setq-local indent-tabs-mode t)
    (setq-local tab-width 8)
    (should (equal (barescript-test-tab-indents 3) '(8 4 0)))
    (should (equal (buffer-string) "if a:\n    if b:\nc = 1\n"))
    (barescript-test-keys "TAB")
    (should (equal (buffer-string) "if a:\n    if b:\n\tc = 1\n"))))


(ert-deftest barescript-test-tab-region ()
  ;; TAB with an active region re-indents the region
  (barescript-test-with-buffer "if a:\nb = 1\nif c:\nd = 1\nendif\nendif\n"
    (transient-mark-mode 1)
    (push-mark (point-max) t t)
    (barescript-test-keys "TAB")
    (should (equal (buffer-string) "if a:\n    b = 1\n    if c:\n        d = 1\n    endif\nendif\n"))))

(ert-deftest barescript-test-blank-line-before-else ()
  ;; A blank line before an "else" is indented like the block's body
  (barescript-test-with-buffer "if a:\n    b = 1|\nelse:\n    c = 1\nendif\n"
    (barescript-test-keys "RET")
    (should (equal (barescript-test-buffer) "if a:\n    b = 1\n    |\nelse:\n    c = 1\nendif\n"))))

(ert-deftest barescript-test-block-statement-comment ()
  ;; A comment line within a continued block statement
  (let ((script "if a && \\\n        # Comment\n        b:\n    c = 1\nendif\n"))
    (barescript-test-with-buffer (replace-regexp-in-string "^ +" "" script)
      (indent-region (point-min) (point-max))
      (should (equal (buffer-string) script)))))


;;
;; Indentation - indent-region
;;

(ert-deftest barescript-test-indent-region ()
  ;; Re-indenting an unindented script restores its indentation
  (let ((script (concat "# Sum the values\n"
                        "async function main(values, args...):\n"
                        "    sum = 0\n"
                        "    for value, ix in values:  # Loop:\n"
                        "        if value < 0:\n"
                        "            continue\n"
                        "        elif value == 0:\n"
                        "            # Zero\n"
                        "            sum = sum + 1\n"
                        "        else:\n"
                        "            sum = sum + arrayJoin([ \\\n"
                        "                value, \\\n"
                        "                ix \\\n"
                        "            ], '')\n"
                        "        endif\n"
                        "    endfor\n"
                        "\n"
                        "    colors = { \\\n"
                        "        'red': [ \\\n"
                        "            255, 0, 0 \\\n"
                        "        ], \\\n"
                        "        'name': 'not: an opener' \\\n"
                        "    }\n"
                        "    while sum > 0 && \\\n"
                        "            ix:\n"
                        "        sum = sum - 1\n"
                        "    endwhile\n"
                        "    return sum\n"
                        "endfunction\n"
                        "\n"
                        "\n"
                        "include 'util.bare'\n"
                        "main([1, 2, 3])\n")))
    (barescript-test-with-buffer (replace-regexp-in-string "^ +" "" script)
      (indent-region (point-min) (point-max))
      (should (equal (buffer-string) script)))))


(ert-deftest barescript-test-indent-region-comments ()
  ;; A comment before an "elif" or "else" lines up with it - other comments are indented like code
  (let ((script (concat "if a:\n"
                        "    b = 1\n"
                        "# Not a\n"
                        "# (and not b)\n"
                        "elif c:\n"
                        "    b = 2\n"
                        "\n"
                        "# Otherwise\n"
                        "else:\n"
                        "    b = 3\n"
                        "    # Done\n"
                        "endif\n"
                        "x = [ \\\n"
                        "    # The first value\n"
                        "    1, \\\n"
                        "    # The second value\n"
                        "    2 \\\n"
                        "]\n")))
    (barescript-test-with-buffer (replace-regexp-in-string "^ +" "" script)
      (indent-region (point-min) (point-max))
      (should (equal (buffer-string) script)))))


;;
;; Performance
;;

(ert-deftest barescript-test-performance-syntax-ppss ()
  ;; Indentation doesn't call `syntax-ppss' for each line of a long statement - it's slow when called at
  ;; positions moving backward in the buffer, and made indentation in long statements quadratic
  (barescript-test-with-buffer ""
    (insert "function f():\n    x = [ \\\n")
    (dotimes (ix 500)
      (insert (format "        {'a': [%d, '# not a comment'], 'b': 'c' + \\\n            'd'}, \\\n" ix)))
    (insert "        1 \\\n    ]\nendfunction\n")
    (let* ((count 0)
           (counter (lambda (&rest _) (setq count (1+ count)))))
      (advice-add 'syntax-ppss :before counter)
      (unwind-protect
          (progn
            (forward-line -3)
            (barescript--expected-indentation)
            (end-of-line)
            (barescript--continuation-needed-p)
            (forward-line 2)
            (barescript--expected-indentation))
        (advice-remove 'syntax-ppss counter))
      (should (< count 10)))))


;;
;; Fill - M-q
;;

(ert-deftest barescript-test-fill-code ()
  (barescript-test-with-buffer "    x = ['one', 'two', |'three', 'four', 'five', 'six']\n"
    (barescript-test-keys "M-q")
    (should (equal (buffer-string) "    x = ['one', 'two', 'three', \\\n        'four', 'five', 'six']\n"))))

(ert-deftest barescript-test-fill-code-idempotent ()
  (barescript-test-with-buffer "x = ['one', 'two', |'three', 'four', 'five', 'six', 'seven']\n"
    (barescript-test-keys "M-q")
    (let ((filled (buffer-string)))
      (barescript-test-keys "M-q")
      (should (equal (buffer-string) filled)))))

(ert-deftest barescript-test-fill-code-continued ()
  ;; Point on a continuation line fills the whole statement
  (barescript-test-with-buffer "x = ['one', \\\n    'two', \\\n    |'three', 'four', 'five', 'six', 'seven']\n"
    (barescript-test-keys "M-q")
    (should (equal (buffer-string) "x = ['one', 'two', 'three', 'four', \\\n    'five', 'six', 'seven']\n"))))

(ert-deftest barescript-test-fill-code-join ()
  ;; A continued statement that fits is joined, without spaces inside brackets
  (barescript-test-with-buffer "x = [ \\\n    |'a', \\\n    'b' \\\n]\n"
    (barescript-test-keys "M-q")
    (should (equal (buffer-string) "x = ['a', 'b']\n"))))

(ert-deftest barescript-test-fill-code-strings ()
  ;; Spaces within strings are not break points
  (barescript-test-with-buffer "x = arrayJoin(['one two three', |'four five six'], ' - ')\n"
    (barescript-test-keys "M-q")
    (should (equal (buffer-string) "x = arrayJoin(['one two three', \\\n    'four five six'], ' - ')\n"))))

(ert-deftest barescript-test-fill-code-short ()
  (barescript-test-with-buffer "x = [1, |2, 3]\n"
    (barescript-test-keys "M-q")
    (should (equal (buffer-string) "x = [1, 2, 3]\n"))))

(ert-deftest barescript-test-fill-code-unbreakable ()
  ;; A token longer than fill-column is put on its own line
  (barescript-test-with-buffer "x = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' + |'b'\n"
    (barescript-test-keys "M-q")
    (should (equal (buffer-string) "x = \\\n    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' \\\n    + 'b'\n"))))

(ert-deftest barescript-test-fill-block-statement ()
  ;; A filled block statement's continuation is indented two levels
  (barescript-test-with-buffer "if aaaa && bbbb && |cccc && dddd && eeee && ffff:\n    x = 1\n"
    (barescript-test-keys "M-q")
    (should (equal (buffer-string) "if aaaa && bbbb && cccc && dddd && \\\n        eeee && ffff:\n    x = 1\n"))))

(ert-deftest barescript-test-fill-comment ()
  (barescript-test-with-buffer "    # one two three four |five six seven eight nine ten\n    x = 1\n"
    (barescript-test-keys "M-q")
    (should (equal (buffer-string) "    # one two three four five six seven\n    # eight nine ten\n    x = 1\n"))))

(ert-deftest barescript-test-fill-trailing-comment ()
  ;; A statement with a comment fills the comment, leaving the code alone
  (barescript-test-with-buffer "x = [1, |2]  # one two three four five six seven\n"
    (barescript-test-keys "M-q")
    (should (equal (buffer-string) "x = [1, 2]  # one two three four five\n            # six seven\n"))))


;;
;; Documentation commands
;;

(ert-deftest barescript-test-open-library-function ()
  (barescript-test-with-buffer "x = array|Length(y)"
    (cl-letf (((symbol-function 'browse-url) #'identity))
      (should (equal (barescript-open-library-function)
                     "https://craigahobbs.github.io/bare-script/library/#var.vName='arrayLength'")))))

(ert-deftest barescript-test-open-library-function-none ()
  (barescript-test-with-buffer "x = 1 |  "
    (cl-letf (((symbol-function 'browse-url) (lambda (_url) (error "Unexpected browse-url"))))
      (should (equal (barescript-open-library-function) "No BareScript function at point")))))

(provide 'barescript-mode-test)

;;; barescript-mode-test.el ends here
