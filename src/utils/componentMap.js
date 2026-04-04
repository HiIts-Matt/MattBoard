import { ClockComponent } from "../components/modules/Clock";
import { PhotoFrame } from "../components/PhotoFrame";
import { ToDoList } from "../components/modules/Todo";
import { Weather } from "../components/modules/Weather";
import { NewsDisplay } from "../components/modules/News";
import { CalendarModule } from "../components/modules/Calendar";

export const components = {
    clock: ClockComponent,
    photo: PhotoFrame,
    todo: ToDoList,
    weather: Weather,
    news: NewsDisplay,
    calendar: CalendarModule,
}