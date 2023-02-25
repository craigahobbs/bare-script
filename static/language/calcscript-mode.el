;;; calcscript-mode.el --- major mode for editing CalcScript

;; Version: 0.3

;;; Commentary:

;; To install, add the following to your .emacs file:

;; (package-initialize)
;;
;; (unless (package-installed-p 'calcscript-mode)
;;   (let ((mode-file (make-temp-file "calcscript-mode")))
;;     (url-copy-file "https://craigahobbs.github.io/calc-script/language/calcscript-mode.el" mode-file t)
;;     (package-install-file mode-file)
;;     (delete-file mode-file)))

;;; Code:
(require 'generic-x)

;;;###autoload
(defun define-calcscript-mode()
  (define-generic-mode 'calcscript-mode
    nil
    '(
      "async"
      "break"
      "continue"
      "do"
      "else"
      "endforeach"
      "endfunction"
      "endif"
      "endwhile"
      "false"
      "foreach"
      "function"
      "if"
      "include"
      "jump"
      "jumpif"
      "null"
      "return"
      "then"
      "true"
      "while"
      )
    '(
      ("^\\s-*\\(#.*\\)$"                                1 font-lock-comment-face)
      ("^\\s-*\\(\\(_\\|\\w\\)+\\s-*:\\)\\s-*$"          1 font-lock-reference-face)
      ("^\\s-*\\(#+.-*\\s-*\\)$"                         1 font-lock-doc-face)
      ("^\\(\\(~~~+\\|```+\\)\\(\\s-*\\(_\\|-\\|\\w\\)+\\)?\\)\\s-*$" 1 font-lock-preprocessor-face)
      ("^\\s-*\\(\\([.]\\|_\\|\\w\\)+\\)\\s-*="          1 font-lock-variable-name-face)
      ("\\('\\(\\\\'\\|[^']\\)*'\\)"                     1 font-lock-string-face)
      )
    '(
      "\\.mds?\\'"
      )
    (list
     (lambda ()
       (setq-local comment-start "#")
       ))
    "Major mode for editing CalcScript"))

;;;###autoload
(define-calcscript-mode)

(provide 'calcscript-mode)
;;; calcscript-mode.el ends here
