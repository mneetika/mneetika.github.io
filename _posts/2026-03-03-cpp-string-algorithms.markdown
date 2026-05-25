---
layout: single
comments: true
title: String Algorithms
date: 2026-03-03 10:00:00-0000
categories: C++
tags: [cpp, algorithms, strings, kmp, z-function, hashing]
---

## KMP Prefix Function
Prefix function (`pi`) stores longest proper prefix that is also suffix for each prefix.
Core idea: reuse previous match length instead of restarting from zero.
How it works: on mismatch, jump using `pi[j-1]`; on match, increase `j`.

Dry-run:
- `s = "aabaaab"`.
- `pi` becomes `[0,1,0,1,2,2,3]`.
- Example: at last index, longest prefix-suffix length is `3` (`"aab"`).

Complexity:
- Time `O(n)`.
- Space `O(n)`.

Edge-case checklist:
- Empty string.
- Off-by-one when falling back with `pi[j-1]`.

{% highlight c++ %}
#include <string>
#include <vector>

std::vector<int> prefixFunction(const std::string& s) {
  int n = static_cast<int>(s.size());
  std::vector<int> pi(n, 0);

  for (int i = 1; i < n; ++i) {
    int j = pi[i - 1];
    while (j > 0 && s[i] != s[j]) {
      j = pi[j - 1];
    }
    if (s[i] == s[j]) {
      ++j;
    }
    pi[i] = j;
  }
  return pi;
}
{% endhighlight %}

## KMP Pattern Search
KMP finds pattern occurrences in linear time.
Core idea: combine text scan with prefix table to avoid redundant comparisons.
How it works: move through text once, and fallback in pattern using `pi`.

Dry-run:
- `text = "ababcabcabababd"`, `pattern = "ababd"`.
- KMP skips re-checking matched prefixes on mismatch.
- Match found at index `10`.

Complexity:
- Time `O(n + m)`.
- Space `O(m)` for prefix table.

Edge-case checklist:
- Empty pattern handling (define behavior explicitly).
- Multiple overlapping matches.

{% highlight c++ %}
#include <string>
#include <vector>

std::vector<int> kmpSearch(const std::string& text, const std::string& pattern) {
  std::vector<int> ans;
  if (pattern.empty()) {
    return ans;
  }

  std::vector<int> pi = prefixFunction(pattern);
  int j = 0;

  for (int i = 0; i < static_cast<int>(text.size()); ++i) {
    while (j > 0 && text[i] != pattern[j]) {
      j = pi[j - 1];
    }
    if (text[i] == pattern[j]) {
      ++j;
    }
    if (j == static_cast<int>(pattern.size())) {
      ans.push_back(i - j + 1);
      j = pi[j - 1];
    }
  }
  return ans;
}
{% endhighlight %}

## Z-Function
Z-array stores match length between `s[i..]` and full string prefix.
Core idea: maintain `[l, r]` segment that matches prefix.
How it works: reuse values inside the current Z-box, then extend manually.

Dry-run:
- `s = "aabxaabx"`.
- `z[4] = 4` because suffix `"aabx"` matches prefix `"aabx"`.
- Z-array helps detect repeated prefix occurrences quickly.

Complexity:
- Time `O(n)`.
- Space `O(n)`.

Edge-case checklist:
- Correct `[l, r]` updates when extension increases right boundary.
- Strings with all same characters.

{% highlight c++ %}
#include <string>
#include <vector>

std::vector<int> zFunction(const std::string& s) {
  int n = static_cast<int>(s.size());
  std::vector<int> z(n, 0);
  int l = 0;
  int r = 0;

  for (int i = 1; i < n; ++i) {
    if (i <= r) {
      z[i] = std::min(r - i + 1, z[i - l]);
    }
    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) {
      ++z[i];
    }
    if (i + z[i] - 1 > r) {
      l = i;
      r = i + z[i] - 1;
    }
  }
  return z;
}
{% endhighlight %}

## Rabin-Karp (Single Pattern)
Rabin-Karp uses rolling hash for fast substring comparison.
Core idea: compare hashes first, verify actual strings on hash match.
How it works: prefix-hash + powers let each window hash be O(1).

Dry-run:
- `text = "abracadabra"`, `pat = "abra"`.
- Window hashes match at positions `0` and `7`.
- String check confirms both are valid matches.

Complexity:
- Time average `O(n + m)`, with verification on hash hits.
- Space `O(n)` for prefix hash and powers.

Edge-case checklist:
- Hash collisions require string verification.
- Empty pattern / pattern longer than text.

{% highlight c++ %}
#include <string>
#include <vector>

std::vector<int> rabinKarp(const std::string& text, const std::string& pat) {
  const long long kMod = 1000000007LL;
  const long long kBase = 911382323LL;
  int n = static_cast<int>(text.size());
  int m = static_cast<int>(pat.size());
  std::vector<int> ans;
  if (m == 0 || m > n) {
    return ans;
  }

  std::vector<long long> p_pow(n + 1, 1);
  std::vector<long long> pref(n + 1, 0);
  for (int i = 1; i <= n; ++i) {
    p_pow[i] = (p_pow[i - 1] * kBase) % kMod;
    pref[i] = (pref[i - 1] * kBase + text[i - 1]) % kMod;
  }

  long long hash_pat = 0;
  for (char c : pat) {
    hash_pat = (hash_pat * kBase + c) % kMod;
  }

  for (int i = 0; i + m <= n; ++i) {
    long long hash_sub = (pref[i + m] - (pref[i] * p_pow[m]) % kMod + kMod) % kMod;
    if (hash_sub == hash_pat && text.compare(i, m, pat) == 0) {
      ans.push_back(i);
    }
  }
  return ans;
}
{% endhighlight %}
