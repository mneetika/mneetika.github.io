---
layout: single
comments: true
title: Monotonic Stack and Deque
date: 2026-02-28 10:00:00-0000
categories: C++
tags: [cpp, algorithms, monotonic-stack, monotonic-queue]
---

## Monotonic Stack: Next Greater Element
Monotonic stack helps with nearest greater/smaller element queries.
Core idea: keep stack in monotonic order so useless candidates are removed.
How it works: process from right; top of stack is next greater candidate.

Dry-run:
- `nums = [2,1,2,4,3]`.
- From right: NGE of `3` is `-1`, of `4` is `-1`, of `2` is `4`, of `1` is `2`, of left `2` is `4`.
- Output: `[4,2,4,-1,-1]`.

Complexity:
- Time `O(n)`.
- Space `O(n)`.

Edge-case checklist:
- Equal elements: choose `<` vs `<=` based on strictness.
- No greater element should map to sentinel (e.g., `-1`).

{% highlight c++ %}
#include <stack>
#include <vector>

std::vector<int> nextGreaterRight(const std::vector<int>& nums) {
  int n = static_cast<int>(nums.size());
  std::vector<int> ans(n, -1);
  std::stack<int> st;  // stores indices

  for (int i = n - 1; i >= 0; --i) {
    while (!st.empty() && nums[st.top()] <= nums[i]) {
      st.pop();
    }
    ans[i] = st.empty() ? -1 : nums[st.top()];
    st.push(i);
  }
  return ans;
}
{% endhighlight %}

## Monotonic Stack: Largest Rectangle in Histogram
This classic problem asks max area using contiguous bars.
Core idea: when height drops, previous taller bars must finish at current index.
How it works: stack stores increasing indices; pop and compute area on violations.

Dry-run:
- `h = [2,1,5,6,2,3]`.
- When hitting `2` at index `4`, pop `6` and `5`.
- Areas computed include `6*1=6`, `5*2=10`.
- Max rectangle area = `10`.

Complexity:
- Time `O(n)`.
- Space `O(n)`.

Edge-case checklist:
- Forgetting final flush (commonly solved by appending `0`).
- Width formula off-by-one errors.

{% highlight c++ %}
#include <algorithm>
#include <stack>
#include <vector>

int largestRectangleArea(std::vector<int> h) {
  h.push_back(0);
  std::stack<int> st;
  int best = 0;

  for (int i = 0; i < static_cast<int>(h.size()); ++i) {
    while (!st.empty() && h[st.top()] > h[i]) {
      int height = h[st.top()];
      st.pop();
      int left = st.empty() ? -1 : st.top();
      int width = i - left - 1;
      best = std::max(best, height * width);
    }
    st.push(i);
  }
  return best;
}
{% endhighlight %}

## Monotonic Deque: Sliding Window Maximum
Monotonic deque gives max/min in every fixed window in O(n).
Core idea: keep deque values decreasing so front is always current max.
How it works: remove out-of-window indices from front, weaker values from back.

Dry-run:
- `nums = [1,3,-1,-3,5,3,6,7], k = 3`.
- Window maxes become: `[3,3,5,5,6,7]`.
- Deque front always holds index of current max.

Complexity:
- Time `O(n)`.
- Space `O(k)` (up to `O(n)` worst-case notation).

Edge-case checklist:
- `k == 1` should return original array.
- `k > n` should be handled explicitly.

{% highlight c++ %}
#include <deque>
#include <vector>

std::vector<int> slidingWindowMax(const std::vector<int>& nums, int k) {
  std::deque<int> dq;  // indices, values in decreasing order
  std::vector<int> out;

  for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
    while (!dq.empty() && dq.front() <= i - k) {
      dq.pop_front();
    }
    while (!dq.empty() && nums[dq.back()] <= nums[i]) {
      dq.pop_back();
    }
    dq.push_back(i);

    if (i >= k - 1) {
      out.push_back(nums[dq.front()]);
    }
  }
  return out;
}
{% endhighlight %}
