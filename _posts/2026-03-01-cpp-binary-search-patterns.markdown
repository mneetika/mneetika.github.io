---
layout: single
comments: true
title: Binary Search Patterns
date: 2026-03-01 10:00:00-0000
categories: C++
tags: [cpp, algorithms, binary-search]
---

## Lower Bound
Lower bound returns first index where value is `>= target`.
Core idea: maintain answer in `[left, right)` search space.
How it works: if `nums[mid] < target`, move left side up; else shrink right.

Dry-run:
- `nums = [1,2,2,2,4], target = 2`.
- Binary search converges to first `2` at index `1`.
- `lowerBound` returns `1`.

Complexity:
- Time `O(log n)`.
- Space `O(1)`.

Edge-case checklist:
- Empty array should return index `0`.
- Target smaller/larger than all elements.

{% highlight c++ %}
#include <vector>

int lowerBound(const std::vector<int>& nums, int target) {
  int left = 0;
  int right = static_cast<int>(nums.size());

  while (left < right) {
    int mid = left + (right - left) / 2;
    if (nums[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}
{% endhighlight %}

## Upper Bound
Upper bound returns first index where value is `> target`.
Core idea: same framework as lower bound with slightly different condition.
How it works: if `nums[mid] <= target`, move left side up; else shrink right.

Dry-run:
- `nums = [1,2,2,2,4], target = 2`.
- Binary search converges to first value `>2`, index `4`.
- `upperBound` returns `4`.

Complexity:
- Time `O(log n)`.
- Space `O(1)`.

Edge-case checklist:
- All elements equal to target.
- Target greater than all elements returns `n`.

{% highlight c++ %}
#include <vector>

int upperBound(const std::vector<int>& nums, int target) {
  int left = 0;
  int right = static_cast<int>(nums.size());

  while (left < right) {
    int mid = left + (right - left) / 2;
    if (nums[mid] <= target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
}
{% endhighlight %}

## Binary Search on Answer
Sometimes you binary-search the answer value, not an array index.
Core idea: define a monotonic predicate `can(mid)`.
How it works: if `can(mid)` is true, try smaller answer; else move to larger.

Dry-run:
- Weights: `[3,2,2,4,1,4]`, days = `3`.
- Capacity `5` works, capacity `4` fails.
- Binary search narrows to minimum feasible capacity `5`.

Complexity:
- Time `O(n log answer_range)`.
- Space `O(1)`.

Edge-case checklist:
- Predicate must be monotonic.
- Bounds (`left`, `right`) must guarantee at least one feasible solution.

{% highlight c++ %}
#include <vector>

bool canShipInDays(const std::vector<int>& weights, int days, int cap) {
  int used_days = 1;
  int curr = 0;
  for (int w : weights) {
    if (w > cap) {
      return false;
    }
    if (curr + w > cap) {
      ++used_days;
      curr = 0;
    }
    curr += w;
  }
  return used_days <= days;
}

int shipWithinDays(const std::vector<int>& weights, int days) {
  int left = 1;
  int right = 0;
  for (int w : weights) {
    left = std::max(left, w);
    right += w;
  }

  while (left < right) {
    int mid = left + (right - left) / 2;
    if (canShipInDays(weights, days, mid)) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  return left;
}
{% endhighlight %}
