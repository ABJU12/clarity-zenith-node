;; ZenithNode Contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-not-owner (err u100))
(define-constant err-already-registered (err u101))
(define-constant err-not-registered (err u102))
(define-constant err-invalid-status (err u103))

;; Data structures
(define-map nodes
  principal
  {
    status: (string-ascii 20),
    reputation: uint,
    last-active: uint,
    peers: (list 10 principal)
  })

(define-data-var total-nodes uint u0)
(define-data-var min-reputation uint u10)

;; Node registration
(define-public (register-node)
  (let ((caller tx-sender))
    (asserts! (is-none (map-get? nodes caller)) err-already-registered)
    (map-set nodes
      caller
      {
        status: "active",
        reputation: u10,
        last-active: block-height,
        peers: (list)
      })
    (var-set total-nodes (+ (var-get total-nodes) u1))
    (ok true)))

;; Update node status
(define-public (update-status (new-status (string-ascii 20)))
  (let ((caller tx-sender))
    (asserts! (is-some (map-get? nodes caller)) err-not-registered)
    (map-set nodes
      caller
      (merge (unwrap-panic (map-get? nodes caller))
        {
          status: new-status,
          last-active: block-height
        }))
    (ok true)))

;; Node validation
(define-public (validate-node (node principal))
  (let ((validator tx-sender)
        (node-data (unwrap! (map-get? nodes node) err-not-registered)))
    (asserts! (is-some (map-get? nodes validator)) err-not-registered)
    (map-set nodes
      node
      (merge node-data
        {
          reputation: (+ (get reputation node-data) u1)
        }))
    (ok true)))

;; Read only functions
(define-read-only (get-node-info (node principal))
  (ok (map-get? nodes node)))

(define-read-only (get-total-nodes)
  (ok (var-get total-nodes)))

(define-read-only (is-active-node (node principal))
  (let ((node-data (map-get? nodes node)))
    (if (is-some node-data)
      (ok (is-eq (get status (unwrap-panic node-data)) "active"))
      (ok false))))
