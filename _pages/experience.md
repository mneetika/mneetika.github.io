---
layout: single
title: Experience
permalink: /experience/
author_profile: true
---

<style>
  .exp-list { display: grid; gap: 1rem; }
  .exp-item { display: flex; gap: 1rem; align-items: center; padding: 0.9rem 1rem; border: 1px solid #e5e7eb; border-radius: 10px; }
  .exp-logo { width: 64px; height: 64px; object-fit: contain; border-radius: 8px; background: #fff; border: 1px solid #f0f0f0; padding: 6px; flex-shrink: 0; }
  .exp-meta { margin-top: 0.2rem; font-size: 0.95rem; color: #555; }
  .exp-meta .sep { margin: 0 0.35rem; color: #999; }
</style>

{% assign items = site.experience | sort: "start_date" | reverse %}
<div class="exp-list">
{% for item in items %}
  {% assign start_year = item.start_date | date: "%Y" | plus: 0 %}
  {% assign start_month = item.start_date | date: "%m" | plus: 0 %}
  {% if item.end_date %}
    {% assign end_year = item.end_date | date: "%Y" | plus: 0 %}
    {% assign end_month = item.end_date | date: "%m" | plus: 0 %}
    {% assign end_label = item.end_date | date: "%b %Y" %}
  {% else %}
    {% assign end_year = "now" | date: "%Y" | plus: 0 %}
    {% assign end_month = "now" | date: "%m" | plus: 0 %}
    {% assign end_label = "Present" %}
  {% endif %}
  {% assign tenure_months = end_year | minus: start_year | times: 12 | plus: end_month | minus: start_month %}
  {% assign tenure_years = tenure_months | divided_by: 12 %}
  {% assign tenure_rem_months = tenure_months | modulo: 12 %}
  {% if tenure_years > 0 and tenure_rem_months > 0 %}
    {% capture tenure_text %}{{ tenure_years }} {% if tenure_years == 1 %}year{% else %}years{% endif %} {{ tenure_rem_months }} {% if tenure_rem_months == 1 %}month{% else %}months{% endif %}{% endcapture %}
  {% elsif tenure_years > 0 %}
    {% capture tenure_text %}{{ tenure_years }} {% if tenure_years == 1 %}year{% else %}years{% endif %}{% endcapture %}
  {% elsif tenure_rem_months > 0 %}
    {% capture tenure_text %}{{ tenure_rem_months }} {% if tenure_rem_months == 1 %}month{% else %}months{% endif %}{% endcapture %}
  {% else %}
    {% capture tenure_text %}< 1 month{% endcapture %}
  {% endif %}
  <div class="exp-item">
    {% if item.logo %}
      <img class="exp-logo" src="{{ '/assets/img/' | append: item.logo | relative_url }}" alt="{{ item.name }} logo" />
    {% endif %}
    <div>
      <strong>{{ item.position }}</strong> | {{ item.name }}
      <div class="exp-meta">
        {{ item.location }}
      </div>
      {% if item.content %}
        <div class="exp-body">
          {{ item.content | markdownify }}
        </div>
      {% endif %}
    </div>
  </div>
{% endfor %}
</div>
