---
layout: single
title: Publications
permalink: /publications/
author_profile: true
published: false
---

{% assign pubs = site.publications | sort: "date" | reverse %}
{% for pub in pubs %}
### {{ pub.title }}
{{ pub.venue }}{% if pub.year %}, {{ pub.year }}{% endif %}

{{ pub.authors }}

{% if pub.paperurl %}[Paper]({{ pub.paperurl }}){% endif %}{% if pub.doi %} · [DOI](https://doi.org/{{ pub.doi }}){% endif %}

{% endfor %}
