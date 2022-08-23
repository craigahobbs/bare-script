;;; calc-script-mode.el --- major mode for editing CalcScript

;; Version: 0.1

;;; Commentary:

;; To install, add the following to your .emacs file:

;; (package-initialize)
;;
;; (unless (package-installed-p 'calc-script-mode)
;;   (let ((mode-file (make-temp-file "calc-script-mode")))
;;     (url-copy-file "https://craigahobbs.github.io/calc-script/language/calc-script-mode.el" mode-file t)
;;     (package-install-file mode-file)
;;     (delete-file mode-file)))
;; (add-to-list 'auto-mode-alist '("\\.mds?\\'" . calc-script-mode))

;;; Code:
(require 'generic-x)

;;;###autoload
(define-generic-mode 'calc-script-mode
      '("#")
      '(
        "endfunction"
        "false"
        "function"
        "include"
        "jump"
        "jumpif"
        "null"
        "return"
        "true"
        )
      (list
       `("\\('[^']*'\\)" 1 font-lock-string-face)
        )
      '(".mds\\'")
      nil
      "Major mode for editing CalcScript")

(provide 'calc-script-mode)
;;; calc-script-mode.el ends here
