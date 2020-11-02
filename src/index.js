import { EMPTY, fromEvent } from 'rxjs'
import { map, debounceTime, distinctUntilChanged, switchMap, mergeMap, tap, catchError, filter } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

const url = 'http://api.github.com/search/users?q=';

const search = document.getElementById('search');
const result = document.getElementById('result');

const stream$ = fromEvent(search, 'input')
        .pipe(
                map(e => e.target.value), // вытаскиваем из ивента значение инпута
                debounceTime(1000), // задержка после последнего ивента 1000мс
                distinctUntilChanged(), // проверка на то что данные изменились
                tap(()=>result.innerHTML = ''), // очистка всего в HTML блоке result (tap или do) выполняет действия не связанные с стримом
                filter(value => value.trim()),//если путая строка то false и не попадает в результаты выборки
                switchMap(value => ajax.getJSON(url + value).pipe(
                        catchError(err => EMPTY)
                )), // создаем новый стрим из текущего в сетевой и отправляем асинхронный запрос на сервер
                map(response => response.items), // вытаскиваем из ответа сервера только нужное поле объекта это массив пользователей
                mergeMap(items => items) //на каждый элемент массива будет вызываться subscribe и будет приходить по одному элементу
        );

stream$.subscribe(val =>
                  {
                    console.log(val);
                    const html = `
                    <div class="card">
                      <div class="card-image">
                        <img src="${val.avatar_url}" alt="">
                        <span class="card-title">${val.login}</span>
                      </div>
                      <div class="card-action">
                        <a href="${val.html_url}" target="_blank">Открыть Github</a>
                      </div>
                    </div>`
                    result.insertAdjacentHTML('beforeend',html)
                  });
