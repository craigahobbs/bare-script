;;; calcscript-mode.el --- major mode for editing CalcScript

;; Version: 0.1

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
    '(?#)
    '(
      "async"
      "endfunction"
      "function"
      "include"
      "jump"
      "jumpif"
      "return"
      )
    '(
      ("\\(null\\|true\\|false\\)"                       1 font-lock-constant-face)
      ("\\('\\(\\\\'\\|[^']\\)+'\\)"                     1 font-lock-string-face)
      ("^\\s-*\\(\\([.]\\|_\\|\\w\\)+\\)\\s-*="          1 font-lock-variable-name-face)
      ("^\\s-*\\(\\(_\\|\\w\\)+\\s-*:\\)"                1 font-lock-reference-face)
      ("^\\s-*\\(#+.-*\\s-*\\)$"                         1 font-lock-doc-face)
      ("^\\(~~~+\\(\\s-*\\(_\\|-\\|\\w\\)+\\)?\\)\\s-*$" 1 font-lock-preprocessor-face)
      )
    '(
      "\\.mds?\\'"
      )
    nil
    "Major mode for editing CalcScript"))

;;;###autoload
(define-calcscript-mode)

(provide 'calcscript-mode)
;;; calcscript-mode.el ends here
