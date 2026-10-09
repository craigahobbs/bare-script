The "hash.bare" include library computes SHA-256 hashes and HMAC-SHA256 message authentication codes
of byte value arrays (arrays of integers 0 to 255) or strings (as UTF-8). Use HMAC-SHA256 to sign and
verify messages, such as JWT HS256 signatures or signed cookies:

```bare-script
include <hash.bare>

signature = hashHex(hashHMACSHA256(secretKey, message))
```

Verify a signature with `hashEqual`, which compares in constant time - `==` stops at the first
difference, so its timing can reveal how much of a guessed signature is right:

```bare-script
isValid = hashEqual(hashHex(hashHMACSHA256(secretKey, message)), signature)
```

The hashes are pure BareScript, so they're fast enough for tokens, signatures, and small documents,
but not for hashing large data repeatedly. Store passwords with a slow, salted key-derivation
function rather than a single SHA-256 hash.
