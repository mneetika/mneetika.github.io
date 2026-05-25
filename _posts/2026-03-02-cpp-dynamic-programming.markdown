---
layout: single
comments: true
title: Dynamic Programming
date: 2026-03-02 10:00:00-0000
categories: C++
tags: [cpp, algorithms, dynamic-programming]
---

## 1D DP: Fibonacci
DP stores answers to subproblems so each state is solved once.
Core idea: define state and transition.
How it works: `dp[i] = dp[i-1] + dp[i-2]`.

Dry-run:
- `n = 6`.
- `dp: [0,1,1,2,3,5,8]`.
- Answer `fib(6) = 8`.

Complexity:
- Time `O(n)`.
- Space `O(n)` (or `O(1)` optimized).

Edge-case checklist:
- `n = 0` and `n = 1`.
- Integer overflow for large `n`.

{% highlight c++ %}
#include <vector>

int fib(int n) {
  if (n <= 1) {
    return n;
  }
  std::vector<int> dp(n + 1, 0);
  dp[1] = 1;
  for (int i = 2; i <= n; ++i) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}
{% endhighlight %}

## 1D DP: 0/1 Knapsack
Knapsack chooses items with weight/value under capacity limit.
Core idea: `dp[c]` = best value using capacity `c`.
How it works: iterate items, update capacities backward to avoid reuse.

Dry-run:
- Weights `[1,3,4]`, values `[15,20,30]`, capacity `4`.
- Best picks: item with weight `4` (value `30`) OR `1+3` (value `35`).
- DP returns `35`.

Complexity:
- Time `O(n * cap)`.
- Space `O(cap)`.

Edge-case checklist:
- Iterating capacity forward would incorrectly allow reuse (becomes unbounded knapsack).
- Zero capacity should return `0`.

{% highlight c++ %}
#include <algorithm>
#include <vector>

int knapsack01(const std::vector<int>& wt, const std::vector<int>& val, int cap) {
  std::vector<int> dp(cap + 1, 0);
  for (int i = 0; i < static_cast<int>(wt.size()); ++i) {
    for (int c = cap; c >= wt[i]; --c) {
      dp[c] = std::max(dp[c], dp[c - wt[i]] + val[i]);
    }
  }
  return dp[cap];
}
{% endhighlight %}

## 1D DP: LIS (O(n log n))
LIS finds longest strictly increasing subsequence length.
Core idea: `tails[len]` keeps smallest possible tail for that length.
How it works: place each value with lower_bound; size of `tails` is answer.

Dry-run:
- `nums = [10,9,2,5,3,7,101,18]`.
- `tails` evolves to `[2,3,7,18]`.
- LIS length = `4`.

Complexity:
- Time `O(n log n)`.
- Space `O(n)`.

Edge-case checklist:
- Duplicates: using `lower_bound` enforces strictly increasing.
- For non-decreasing variant, use `upper_bound`.

{% highlight c++ %}
#include <algorithm>
#include <vector>

int lengthOfLis(const std::vector<int>& nums) {
  std::vector<int> tails;
  for (int x : nums) {
    auto it = std::lower_bound(tails.begin(), tails.end(), x);
    if (it == tails.end()) {
      tails.push_back(x);
    } else {
      *it = x;
    }
  }
  return static_cast<int>(tails.size());
}
{% endhighlight %}

## 2D DP: Longest Common Subsequence
LCS finds longest sequence present in both strings in order.
Core idea: `dp[i][j]` = LCS length for prefixes `a[0..i-1]` and `b[0..j-1]`.
How it works:
- If chars match: `1 + dp[i-1][j-1]`.
- Else: `max(dp[i-1][j], dp[i][j-1])`.

Dry-run:
- `a = "abcde"`, `b = "ace"`.
- Matching chain: `a -> c -> e`.
- LCS length = `3`.

Complexity:
- Time `O(n * m)`.
- Space `O(n * m)` (or `O(min(n,m))` optimized).

Edge-case checklist:
- Empty string input.
- Case sensitivity and normalization choices.

{% highlight c++ %}
#include <algorithm>
#include <string>
#include <vector>

int lcs(const std::string& a, const std::string& b) {
  int n = static_cast<int>(a.size());
  int m = static_cast<int>(b.size());
  std::vector<std::vector<int>> dp(n + 1, std::vector<int>(m + 1, 0));

  for (int i = 1; i <= n; ++i) {
    for (int j = 1; j <= m; ++j) {
      if (a[i - 1] == b[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];
      } else {
        dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[n][m];
}
{% endhighlight %}
