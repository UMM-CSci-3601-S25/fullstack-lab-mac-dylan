package umm3601.Todos;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;

import org.bson.Document;
import org.bson.UuidRepresentation;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.result.DeleteResult;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import umm3601.Controller;

/**
 * Controller that manages requests for info about todos.
 */
public class TodoController implements Controller {

  private static final String API_TODOS = "/api/todos";
  private static final String API_TODO_BY_ID = "/api/todos/{id}";
  static final String OWNER_KEY = "owner";
  public static final String STATUS_KEY = "status";
  public static final String CATEGORY_KEY = "category";
  public static final String LIMIT_KEY = "limit";
  static final String SORT_ORDER_KEY = "sortorder";

  private final JacksonMongoCollection<Todo> todoCollection;

  /**
   * Construct a controller for todos.
   *
   * @param database the database containing todo data
   */
  public TodoController(MongoDatabase database) {
    todoCollection = JacksonMongoCollection.builder().build(
        database,
        "todos",
        Todo.class,
        UuidRepresentation.STANDARD);
  }

  /**
   * Set the JSON body of the response to be the single todo
   * specified by the `id` parameter in the request
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodoById(Context ctx) {
    String id = ctx.pathParam("id");
    Todo todo;

    try {
      todo = todoCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested todo id wasn't a legal Mongo Object ID.");
    }
    if (todo == null) {
      throw new NotFoundResponse("The requested todo was not found");
    } else {
      ctx.json(todo);
      ctx.status(HttpStatus.OK);
    }
  }

  /**
   * Set the JSON body of the response to be a list of all the todos returned from the database
   * that match any requested filters and ordering
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodos(Context ctx) {
    Bson combinedFilter = constructFilter(ctx);
    Bson sortingOrder = constructSortingOrder(ctx);

    ArrayList<Todo> matchingTodos = todoCollection
      .find(combinedFilter)
      .sort(sortingOrder)
      .limit(limit(ctx))
      .into(new ArrayList<>());

    ctx.json(matchingTodos);
    ctx.status(HttpStatus.OK);
  }

  /**
   * Construct a Bson filter document to use in the `find` method based on the
   * query parameters from the context.
   *
   * This checks for the presence of the `owner`, `status`, and `category` query
   * parameters and constructs a filter document that will match todos with
   * the specified values for those fields.
   *
   * @param ctx a Javalin HTTP context, which contains the query parameters
   *    used to construct the filter
   * @return a Bson filter document that can be used in the `find` method
   *   to filter the database collection of todos
   */
  private Bson constructFilter(Context ctx) {
    List<Bson> filters = new ArrayList<>(); // start with an empty list of filters

    if (ctx.queryParamMap().containsKey(OWNER_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(OWNER_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(OWNER_KEY, pattern));
    }
    if (ctx.queryParamMap().containsKey(STATUS_KEY)) {
      String statusParam = ctx.queryParam(STATUS_KEY);
      boolean targetStatus;
      if (statusParam.equalsIgnoreCase("complete") || statusParam.equalsIgnoreCase("true")) {
        targetStatus = true;
      } else if (statusParam.equalsIgnoreCase("incomplete") || statusParam.equalsIgnoreCase("false")) {
        targetStatus = false;
      } else {
        throw new BadRequestResponse("Todo status must be 'complete', 'incomplete', 'true', or 'false'");
      }
      filters.add(eq(STATUS_KEY, targetStatus));
    }
    if (ctx.queryParamMap().containsKey(CATEGORY_KEY)) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam(CATEGORY_KEY)), Pattern.CASE_INSENSITIVE);
      filters.add(regex(CATEGORY_KEY, pattern));
    }
    if (ctx.queryParamMap().containsKey("body")) {
      Pattern pattern = Pattern.compile(Pattern.quote(ctx.queryParam("body")), Pattern.CASE_INSENSITIVE);
      filters.add(regex("body", pattern));
    }

    Bson combinedFilter = filters.isEmpty() ? new Document() : and(filters);

    return combinedFilter;
  }

  /**
   * Construct a Bson sorting document to use in the `sort` method based on the
   * query parameters from the context.
   *
   * This checks for the presence of the `sortby` and `sortorder` query
   * parameters and constructs a sorting document that will sort todos by
   * the specified field in the specified order. If the `sortby` query
   * parameter is not present, it defaults to "owner". If the `sortorder`
   * query parameter is not present, it defaults to "asc".
   *
   * @param ctx a Javalin HTTP context, which contains the query parameters
   *   used to construct the sorting order
   * @return a Bson sorting document that can be used in the `sort` method
   *  to sort the database collection of todos
   */
  private Bson constructSortingOrder(Context ctx) {
    String sortBy = Objects.requireNonNullElse(ctx.queryParam("sortby"), "owner");
    String sortOrder = Objects.requireNonNullElse(ctx.queryParam("sortorder"), "asc");
    Bson sortingOrder = sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy);
    return sortingOrder;
  }

  /**
   * Add a new todo using information from the context
   * (as long as the information gives "legal" values to Todo fields)
   *
   * @param ctx a Javalin HTTP context that provides the todo info
   *  in the JSON body of the request
   */
  public void addNewTodo(Context ctx) {
    String body = ctx.body();
    Todo newTodo = ctx.bodyValidator(Todo.class)
      .check(todo -> todo.owner != null && todo.owner.length() > 0,
        "Todo must have a non-empty owner; body was " + body)
      .check(todo -> todo.category != null && todo.category.length() > 0,
        "Todo must have a non-empty category; body was " + body)
      .check(todo -> todo.body != null && todo.body.length() > 0,
        "Todo must have a non-empty body; body was " + body)
      .get();

    todoCollection.insertOne(newTodo);

    ctx.json(Map.of("id", newTodo._id));
    ctx.status(HttpStatus.CREATED);
  }

  /**
   * Delete the todo specified by the `id` parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void deleteTodoById(Context ctx) {
    String id = ctx.pathParam("id");
    DeleteResult deleteResult = todoCollection.deleteOne(eq("_id", new ObjectId(id)));
    if (deleteResult.getDeletedCount() != 1) {
      ctx.status(HttpStatus.NOT_FOUND);
      throw new NotFoundResponse(
        "Was unable to delete ID "
          + id
          + "; perhaps illegal ID or an ID for an item not in the system?");
    }
    ctx.status(HttpStatus.OK);
  }

  /**
   * Sets up routes for the `todo` collection endpoints.
   * A TodoController instance handles the todo endpoints,
   * and the addRoutes method adds the routes to this controller.
   *
   * These endpoints are:
   *   - `GET /api/todos/:id`
   *       - Get the specified todo
   *   - `GET /api/todos?owner=STRING&status=BOOLEAN&category=STRING`
   *      - List todos, filtered using query parameters
   *   - `DELETE /api/todos/:id`
   *      - Delete the specified todo
   *   - `POST /api/todos`
   *      - Create a new todo
   *      - The todo info is in the JSON body of the HTTP request
   *
   * @param server The Javalin server instance
   */
private int limit(Context ctx) {
    if (ctx.queryParamMap().containsKey(LIMIT_KEY)) {
      int targetLimit = ctx.queryParamAsClass(LIMIT_KEY, Integer.class)
      .check(it -> it > 0, "Limit should be greater than 0. You gave" + ctx.queryParam(LIMIT_KEY))
      .get();
      return targetLimit;
    } else {
      return (int) todoCollection.countDocuments();
    }
  }


  @Override
  public void addRoutes(Javalin server) {
    server.get(API_TODO_BY_ID, this::getTodoById);
    server.get(API_TODOS, this::getTodos);
    server.post(API_TODOS, this::addNewTodo);
    server.delete(API_TODO_BY_ID, this::deleteTodoById);
  }
}
