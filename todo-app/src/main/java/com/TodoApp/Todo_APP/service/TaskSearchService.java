package com.TodoApp.Todo_APP.service;

import com.TodoApp.Todo_APP.dto.TaskResponseDTO;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.FSDirectory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Service
public class TaskSearchService {

    private static final Logger LOGGER = Logger.getLogger(TaskSearchService.class.getName());

    @Value("${lucene.index.directory}")
    private String indexDir;

    private final TaskService taskService;
    private IndexWriter indexWriter;

    public TaskSearchService(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostConstruct
    public void init() throws IOException {
        LOGGER.info("Initializing Lucene index at: " + indexDir);
        FSDirectory directory = FSDirectory.open(Paths.get(indexDir));
        StandardAnalyzer analyzer = new StandardAnalyzer();
        IndexWriterConfig config = new IndexWriterConfig(analyzer);
        indexWriter = new IndexWriter(directory, config);
        reindexAllTasks();
    }

    public void indexTask(TaskResponseDTO task) throws IOException {
        LOGGER.info("Indexing task ID: " + task.getId());
        Document doc = new Document();
        doc.add(new StringField("id", task.getId().toString(), Field.Store.YES));
        doc.add(new TextField("title", task.getTitle() != null ? task.getTitle() : "", Field.Store.YES));
        doc.add(new TextField("content", task.getContent() != null ? task.getContent() : "", Field.Store.YES));
        indexWriter.addDocument(doc);
        indexWriter.commit();
    }

    public void deleteTaskIndex(Long id) throws IOException {
        LOGGER.info("Deleting index for task ID: " + id);
        indexWriter.deleteDocuments(new TermQuery(new Term("id", id.toString())));
        indexWriter.commit();
    }

    public List<TaskResponseDTO> searchTasks(String queryStr) throws IOException {
        if (queryStr == null || queryStr.trim().isEmpty()) {
            LOGGER.warning("Empty search query received");
            return new ArrayList<>();
        }
        LOGGER.info("Searching for: " + queryStr);
        List<TaskResponseDTO> results = new ArrayList<>();
        try (IndexReader reader = DirectoryReader.open(FSDirectory.open(Paths.get(indexDir)))) {
            IndexSearcher searcher = new IndexSearcher(reader);
            StandardAnalyzer analyzer = new StandardAnalyzer();
            QueryParser parser = new QueryParser("content", analyzer);
            parser.setDefaultOperator(QueryParser.OR_OPERATOR);
            Query query = parser.parse(QueryParser.escape(queryStr) + " OR title:" + QueryParser.escape(queryStr));
            TopDocs topDocs = searcher.search(query, 100);
            for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
                Document doc = searcher.storedFields().document(scoreDoc.doc);
                String idStr = doc.get("id");
                LOGGER.info("Found document with ID: " + idStr);
                Long id = Long.parseLong(idStr);
                TaskResponseDTO taskDTO = taskService.getTaskById(id);
                if (taskDTO != null) {
                    results.add(taskDTO);
                }
            }
        } catch (Exception e) {
            LOGGER.severe("Search failed: " + e.getMessage());
            throw new IOException("Search failed: " + e.getMessage(), e);
        }
        return results;
    }

    public void reindexAllTasks() throws IOException {
        LOGGER.info("Reindexing all tasks");
        indexWriter.deleteAll();
        List<TaskResponseDTO> tasks = taskService.getAllTasks();
        for (TaskResponseDTO task : tasks) {
            indexTask(task);
        }
        indexWriter.commit();
    }
}