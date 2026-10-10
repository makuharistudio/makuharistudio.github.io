import { Panel } from './Panel.ts';

interface Certification {
  name: string;
  date: string;
  id: string;
  url: string;
}

const CERTIFICATIONS: Certification[] = [
  {
    name: 'Neo4j Graph Data Science',
    date: '7 November 2023',
    id: 'C70E7300-B94F-4E92-9AE1-989E41CB42A8',
    url: 'https://graphacademy.neo4j.com/c/c70e7300-b94f-4e92-9ae1-989e41cb42a8',
  },
  {
    name: 'Neo4j Certified Professional',
    date: '21 October 2023',
    id: 'CEA1E9CF-A45D-42AC-A1DB-2EFFE5890AE5',
    url: 'https://graphacademy.neo4j.com/c/cea1e9cf-a45d-42ac-a1db-2effe5890ae5',
  },
];

export function CertificationList(): HTMLElement {
  const wrap = document.createElement('div');
  const heading = document.createElement('center');
  const h2 = document.createElement('h2');
  h2.textContent = 'CERTIFICATIONS';
  heading.appendChild(h2);
  wrap.appendChild(heading);

  const list = document.createElement('div');
  list.id = 'certification-list';

  for (const cert of CERTIFICATIONS) {
    const a = document.createElement('a');
    a.href = cert.url;
    a.target = '_blank';
    a.rel = 'noreferrer';

    const body = document.createElement('div');
    const date = document.createElement('h5');
    date.textContent = cert.date;
    const name = document.createElement('h3');
    name.textContent = cert.name;
    const id = document.createElement('h4');
    id.textContent = cert.id;
    const url = document.createElement('p');
    url.textContent = cert.url;
    body.append(date, name, id, url);
    a.appendChild(Panel(body));
    list.appendChild(a);
  }

  wrap.appendChild(list);
  return wrap;
}
