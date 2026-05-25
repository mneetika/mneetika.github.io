---
layout: single
comments: true
title: Sliding Window and Two Pointers
date: 2026-02-27 10:00:00-0000
categories: C++
tags: [cpp, algorithms, sliding-window, two-pointers, array]
---

## Fixed-Size Window Sum
Use fixed-size sliding window when subarray length is constant.
Core idea: update window in O(1) by adding right element and removing left.
How it works: first build initial window, then slide one step at a time.

Dry-run:
- `nums = [2,1,5,1,3,2], k = 3`.
- First window sum = `2+1+5 = 8`.
- Slide: `[1,5,1] => 7`, `[5,1,3] => 9`, `[1,3,2] => 6`.
- Max sum = `9`.

Complexity:
- Time `O(n)`.
- Space `O(1)`.

Edge-case checklist:
- `k <= 0` or `k > n`.
- Negative numbers still work for fixed-size sum.

{% highlight c++ %}
#include <vector>

int maxSumSubarrayK(const std::vector<int>& nums, int k) {
  if (k <= 0 || k > static_cast<int>(nums.size())) {
    return 0;
  }

  int window_sum = 0;
  for (int i = 0; i < k; ++i) {
    window_sum += nums[i];
  }

  int best = window_sum;
  for (int r = k; r < static_cast<int>(nums.size()); ++r) {
    window_sum += nums[r];
    window_sum -= nums[r - k];
    best = std::max(best, window_sum);
  }
  return best;
}
{% endhighlight %}

## Variable-Size Window (Longest with Sum <= k)
Variable window is used when valid segment size is not fixed.
Core idea: expand right pointer, shrink left while constraint breaks.
How it works: maintain valid window and update best length.

Dry-run:
- `nums = [1,2,1,0,1,1,0], k = 4`.
- Expand right while sum <= 4.
- On overflow, move left until valid again.
- Longest valid length observed = `5`.

Complexity:
- Time `O(n)` (each index moves at most once).
- Space `O(1)`.

Edge-case checklist:
- This exact pattern assumes non-negative values.
- For arrays with negatives, shrinking on `sum > k` is not always valid.

{% highlight c++ %}
#include <algorithm>
#include <vector>

int longestSubarrayAtMostK(const std::vector<int>& nums, int k) {
  int left = 0;
  int sum = 0;
  int best = 0;

  for (int right = 0; right < static_cast<int>(nums.size()); ++right) {
    sum += nums[right];
    while (sum > k && left <= right) {
      sum -= nums[left];
      ++left;
    }
    best = std::max(best, right - left + 1);
  }
  return best;
}
{% endhighlight %}

## Two Pointers on Sorted Array (2-Sum)
Two pointers is ideal on sorted arrays for pair-based targets.
Core idea: small sum -> move left up, large sum -> move right down.
How it works: each move discards impossible pairs, giving O(n) time.

Dry-run:
- `nums = [1,2,4,7,11], target = 9`.
- `left=0, right=4`: sum `12` > `9`, move right.
- `left=0, right=3`: sum `8` < `9`, move left.
- `left=1, right=3`: sum `9`, answer indices `(1,3)`.

Complexity:
- Time `O(n)`.
- Space `O(1)`.

Edge-case checklist:
- Input must be sorted.
- Duplicate values may produce multiple valid answers.

{% highlight c++ %}
#include <utility>
#include <vector>

std::pair<int, int> twoSumSorted(const std::vector<int>& nums, int target) {
  int left = 0;
  int right = static_cast<int>(nums.size()) - 1;

  while (left < right) {
    int sum = nums[left] + nums[right];
    if (sum == target) {
      return {left, right};
    }
    if (sum < target) {
      ++left;
    } else {
      --right;
    }
  }
  return {-1, -1};
}
{% endhighlight %}
